(function($) {
    function getStock(opts, type, complete) {
        var defs = {
            desc: false,
            baseURL: 'http://query.yahooapis.com/v1/public/yql?q=',
            query: {
                quotes: 'select * from yahoo.finance.quotes where symbol = "{stock}" | sort(field="{sortBy}", descending="{desc}")',
                historicaldata: 'select * from yahoo.finance.historicaldata where symbol = "{stock}" and startDate = "{startDate}" and endDate = "{endDate}"'
            },
            suffixURL: {
                quotes: '&env=store://datatables.org/alltableswithkeys&format=json&callback=?',
                historicaldata: '&env=store://datatables.org/alltableswithkeys&format=json&callback=?'
            }
        };

        opts = opts || {};

        if (!opts.stock) {
            complete('No stock defined');
            return;
        }

        var query = defs.query[type]
            .replace('{stock}', opts.stock)
            .replace('{sortBy}', defs.sortBy)
            .replace('{desc}', defs.desc)
            .replace('{startDate}', opts.startDate)
            .replace('{endDate}', opts.endDate);

        var url = defs.baseURL + query + (defs.suffixURL[type] || '');
        $.getJSON(url, function(data) {
            var err = null;
            if (!data || !data.query) {
                err = true;
            }
            complete(err, !err && data.query.results);});
    }
    window.getStock = getStock;
})(jQuery);

var clean = function(dataset){
    data = [];
    for (var quote in dataset) {
        data.push(dataset[quote]["Close"]);
    }
    return data;
};

$(document).ready(function(){

    $( "#stockForm" ).submit(function( event ) {
        var datasets = [];
        var vdatasets = [];
        event.preventDefault();
        var info = {stock1:$('#stock1').val(), stock2:$('#stock2').val(), min:$("#min").val(), max:$("#max").val() };
        console.log(info);
        var addData = function(dataset){
            //add data
            datasets.push(dataset);
            var cleanedData = clean(dataset.quote);
            vdatasets.push([dataset.quote[0]["Symbol"]].concat(cleanedData));

            //callback
            if(datasets.length == 2) {
                console.log("display data");
                var data1 = datasets[0]["quote"];
                var data2 = datasets[1]["quote"];

                $("#stock1ticker").text(data1[0]["Symbol"]);
                $("#stock2ticker").text(data2[0]["Symbol"]);
                $("#spread").text("Spread");
                var i=0;
                var chart = c3.generate({
                    bindto: '#chart',
                    data: {
                        columns: [
                            vdatasets[0].slice(0,i+1),
                            vdatasets[1].slice(0,i+1)
                        ]
                    }
                });
                function myLoop(){
                    setTimeout(function(){
                        var mktcap1 = parseFloat(data1[i]["Close"])*parseFloat(data1[i]["Volume"]);
                        var mktcap2 = parseFloat(data2[i]["Close"])*parseFloat(data2[i]["Volume"]);
                        var diffprice = Math.abs(parseFloat(data1[i]["Close"]) - parseFloat(data2[i]["Close"]));
                        var diffvol = Math.abs(parseFloat(data1[i]["Volume"]) - parseFloat(data2[i]["Volume"]));
                        var diffcap = Math.abs(mktcap1 - mktcap2);

                        $("#stock1Price").html(data1[i]["Close"]);
                        $("#stock2Price").html(data2[i]["Close"]);
                        $("#stock1Vol").html(data1[i]["Volume"]);
                        $("#stock2Vol").html(data2[i]["Volume"]);
                        $("#stock1Cap").html(mktcap1);
                        $("#stock2Cap").html(mktcap2);
                        $("#DiffPrice").html(diffprice);
                        $("#DiffVol").html(diffvol);
                        $("#DiffCap").html(diffcap);

                        //Generates the chart each time
                        chart.load({
                            columns:[vdatasets[0].slice(0,i+1),
                                vdatasets[1].slice(0,i+1)]
                        });
//                            var chart = c3.generate({
//                                bindto: '#chart',
//                                data: {
//                                    columns: [
//                                        vdatasets[0].slice(0,i+1),
//                                        vdatasets[1].slice(0,i+1)
//                                    ]
//                                }
//                            });

                        i++;
                        if (i<data1.length){
                            myLoop();
                        }
                    },1000)
                }
                myLoop();
            }
        };
        getStock({ stock: info.stock1, startDate: '2013-01-01', endDate: '2013-05-05' }, 'historicaldata', function(err, data) {
            addData(data);
        });
        getStock({ stock: info.stock2, startDate: '2013-01-01', endDate: '2013-05-05' }, 'historicaldata', function(err, data) {
            addData(data);
        });

    });
});