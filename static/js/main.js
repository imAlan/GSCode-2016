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
            .replace('{endDate}', opts.endDate)

        var url = defs.baseURL + query + (defs.suffixURL[type] || '');
        $.getJSON(url, function(data) {
            var err = null;
            if (!data || !data.query) {
                err = true;

            }
            complete(err, !err && data.query.results);    });
    }
    window.getStock = getStock;
})(jQuery);

var datasets = [];

var clean = function(dataset){
    data = [];
    for (var quote in dataset) {
        data.push(dataset[quote]["Close"]);
    }
    return data;
    //console.log(data);
};

var addData = function (dataset){
    var cleanedData = clean(dataset.quote);
    datasets.push([dataset.quote[0]["Symbol"]].concat(cleanedData));
    if (datasets.length == 2){
        console.log(datasets);

        var chart = c3.generate({
            bindto: '#chart',
            data: {
                columns: [
                    datasets[0],
                    datasets[1]
                ]
            }
        });
    }
};

getStock({ stock: 'KO', startDate: '2015-01-01', endDate: '2015-05-05' }, 'historicaldata', function(err, data) {

    addData(data);
    //console.log(data);
});

getStock({ stock: 'PEP', startDate: '2015-01-01', endDate: '2015-05-05' }, 'historicaldata', function(err, data) {
    addData(data);
});

