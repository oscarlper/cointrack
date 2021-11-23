var url = "https://www.binance.com";

var query = '/api/v1/ticker/24hr';

//query += '?symbol=BTCUSDT';

var url = url + query;

var parCrypto = [];

function callBinance(mode) {
    var f = (function(){
        var binanceRequest = [], i;
            (function(i){
                i++;
                binanceRequest[i] = new XMLHttpRequest();
                binanceRequest[i].open("GET", url, true);
                binanceRequest[i].onreadystatechange = function(){
                    if (binanceRequest[i].readyState === 4 && binanceRequest[i].status === 200){
                        parCrypto=JSON.parse(binanceRequest[i].responseText);
                        if (mode == "listAssets") {
                            populatePairs(parCrypto,mode)
                        } else {
                            populatePairs(parCrypto,mode)
                        }
                    }
                };
                binanceRequest[i].send();
            })(i);
    })();
}

callBinance("listAssets");
