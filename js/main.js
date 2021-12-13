// Get data de Binance Con AJAX Jquery //

let parCrypto = [];

//let trendDataArray = [];

//let trendDataFlag = true;

function callBinance(mode) {

    let status;

    const apiURLBinance = "https://www.binance.com/api/v1/ticker/24hr";
    $.ajax({
        dataType: "json",
        method: "GET",
        url: apiURLBinance,
        success: function(apiDataBinance) {
            parCrypto = apiDataBinance;
            populatePairs(parCrypto,mode);
        }
    })
}

callBinance("listAssets");

// Fin Get data de Binance //

// variable de id de Interval al metodo callBinance
var idInterval;
var assetToCalc = [];

var mode = "listAssets";

$('#assetValues').submit(false);

//jquery event click checkbox orderassets
$('#sortedAssets').on('click', () => {populatePairs(parCrypto, mode)});

var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
      datasets: [{
      label: '% Amount USDT',
      data: [0],
      backgroundColor: [
        'rgba(33, 150, 243, 0.7)',
        'rgba(0, 200, 83, 0.7)',
        'rgba(255, 235, 59, 0.7)',
        'rgba(255, 65, 129, 0.7)'
      ],
      borderColor: [
        'rgba(0, 0, 0, 1)',
        'rgba(0, 0, 0, 1)',
        'rgba(0, 0, 0, 1)',
        'rgba(0, 0, 0, 1)'
      ],
      borderWidth: 1
    }]
  },
  options: {
   	//cutoutPercentage: 40,
    responsive: true,
  }
});

/* Grafica estadistica proxima version
var ctx2 = document.getElementById("myTrendChart");
var myChart = new Chart(ctx2, {
  type: 'line',
  data: {
      datasets: [{
      label: 'Historical Trend Chart',
      data: [0],
      backgroundColor: [
        'rgba(33, 150, 243, 0.7)',
        'rgba(0, 200, 83, 0.7)',
        'rgba(255, 235, 59, 0.7)',
        'rgba(255, 65, 129, 0.7)'
      ],
      borderColor: [
        'rgba(0, 0, 0, 1)',
        'rgba(0, 0, 0, 1)',
        'rgba(0, 0, 0, 1)',
        'rgba(0, 0, 0, 1)'
      ],
      borderWidth: 1
    }]
  },
  options: {
   	//cutoutPercentage: 40,
    responsive: true,
  }
});

*/

// metodo para cargar los pares en Assets, opcion de ordenado con llamado a sortAssets
function populatePairs(parCrypto, mode) {

    let changePercent = 0.0;

    if (mode == "listAssets") {
        $('#buttons').append("<button id='initButton' type='button' class='btn btn-primary btn-sm'  onclick='idInterval=trackInit(true)'>Start</button>");
         $('#initButton').prop('disabled', true);
        $('#messages').html("<p>Seleccione los pares y presione [Start]</p>");
    }

     let htmlPrintPairs = "<form id='formCheckPairs'><table id=listAssets class='table table-sm table-dark table-striped text-white'>";

     if ($('#sortedAssets').is(":checked")){
        parCrypto=sortAssets(parCrypto);
    }

    for (const assetBinance of parCrypto.filter( assetUSDT => assetUSDT.symbol.substring(assetUSDT.symbol.length - 4) == "USDT")) {
        if (mode != "run") {
            htmlPrintPairs+= "<tr><td><input type='checkbox' id="+assetBinance.symbol+" onclick=verifyInput()>&nbsp&nbsp<label class=fs-7>"+assetBinance.symbol+"</label></td><td width=10% id=a_"+ assetBinance.symbol+ "></td></tr>";
        } else {
            changePercent = parseFloat(assetBinance.priceChangePercent).toFixed(2);
            if (changePercent >=0) {
                htmlPrintPairs+= "<tr><td><span class=fs-7>"+assetBinance.symbol+"</span></td><td class=fs-7 width=20%><span id=achg_"+ assetBinance.symbol+" class=ticker-green>"+changePercent+"</span></td><td width=50% class=fs-7 id=a_"+ assetBinance.symbol+ ">"+assetBinance.lastPrice+"</td></tr>";
            } else {
                htmlPrintPairs+= "<tr><td><span class=fs-7>"+assetBinance.symbol+"</span></td><td class=fs-7 width=20%><span id=achg_"+ assetBinance.symbol+" class=ticker-red>"+changePercent+"</span></td><td width=50% class=fs-7 id=a_"+ assetBinance.symbol+ ">"+assetBinance.lastPrice+"</td></tr>";
            }
        }
    }
    htmlPrintPairs+= "</form></table>";

    document.getElementById('pairs').innerHTML = htmlPrintPairs;

    if ($('#searchAssetsBox').val() != '') 
    {
        searchAssets();
    }

}

// metodo que lee los assets seleccionados mediante checkbox
function readSelectedAssets(parCrypto) {

    itemInitValue = 0.00000000;

    let cryptoWalletLSession = restoreSession();

    let htmlPrintPairs = "<form class='form-control-sm text-white' id=listPairs><table class='table table-sm table-dark table-striped text-white fs-7'><tr><th>Asset</th><th>Amount</th></tr>";

    for (const assetBinance of parCrypto.filter( assetUSDT => assetUSDT.symbol.substring(assetUSDT.symbol.length - 4) == "USDT")) {
        if ($('#'+assetBinance.symbol).is(":checked")){
        
            if (cryptoWalletLSession) {
                for (const cryptoWalletItem of cryptoWalletLSession){
                    
                    if (cryptoWalletItem.asset == assetBinance.symbol) {
                        itemValue = cryptoWalletItem.amount;
                        break;
                    } else {
                        itemValue = itemInitValue;
                    }
                }
            } else {
                itemValue = 0.00000000;
            }

            htmlPrintPairs+= "<tr><td><label>"+assetBinance.symbol+"&nbsp&nbsp</label></td>";
            htmlPrintPairs+= "<td><input value="+itemValue+" class='testField form-control form-control-sm' id=w_"+assetBinance.symbol+" type='text' onKeyUp=verifyInput(listPairs,'assetValues','trackButton')></td>";
            htmlPrintPairs+= "<td id="+ assetBinance.symbol+ "></td>";
            htmlPrintPairs+= "</tr>";

            assetToCalc.push(assetBinance.symbol);
        }
    
    }

    htmlPrintPairs+= "</table></form>";

    document.getElementById('wallet').innerHTML = htmlPrintPairs;

    $('#initButton').hide();
    $('#buttons').append("<button id=trackButton class='btn btn-primary btn-sm' onclick='trackAsset(mode)'>Track</button>");

    $('#trackButton').prop('disabled', true);

    $('#messages').html("<p class='text-primary'>Ingrese sus tenencias y presione [TRACK]</p>");
    
    $('#searchAssetsBox').val('');
    
    verifyInput(listPairs,'assetValues','trackButton');

}

// inicio del intervalo para actualizar los valores del exchange
function trackInit(state,idInterval){

    mode = "run";
    callBinance(mode);
    if (state) {
        readSelectedAssets(parCrypto);
        var idInterval=setInterval(callBinance,4000,mode);
    } else{
        clearInterval(idInterval);
    }
    return(idInterval)
}

// metodo para calcular la tenencia en USDT segun los pares seleccionados
// y el valor ingresado de tenencia en la moneda crypto.
function trackAsset() {

    $('#trackButton').hide();
    $('#messages').html('<p>Trackeando Assets</p>');
    
    $('#buttons').append("<button class='btn btn-danger btn-sm' onclick='location.reload(true)'>Restart</button>");
    
    var amountAtUSDT;

    var totalUSDT;

    let htmlPrintAmount = "<table class='table table-sm table-dark table-striped text-white' ><tr><th>Asset</th><th>%</th><th>USDT</th><th>Chg.%</th><th>Price</th></tr>";

    class cryptoClass {
        constructor(asset,amount) {
            this.asset = asset;
            this.amount = parseFloat(amount);
            this.amountUSDT;
            this.assetChecked;
        }
        calcAmount(lastPrice) {
            this.amountUSDT = document.getElementById("a_"+this.asset).innerHTML * this.amount;
            amountAtUSDT = (lastPrice*this.amount).toFixed(2);
            return(amountAtUSDT);
        }
    }

    const cryptoWallet = [];

    for (let i=0; i< assetToCalc.length ;i++) {
        cryptoWallet.push(new cryptoClass(assetToCalc[i],parseFloat(document.getElementById('w_'+assetToCalc[i]).value)));
    }

    for (const pairSelect of cryptoWallet) {
        actualChg = $('#achg_'+pairSelect.asset).html();
        actualPrice = document.getElementById('a_'+pairSelect.asset).innerHTML;
        htmlPrintAmount+= "<tr><td>"+pairSelect.asset+"</td><td id=u_"+pairSelect.asset+"></td><td id=w_"+pairSelect.asset+">"+pairSelect.calcAmount(actualPrice)+"</td><td><span class=styleChg id=wchg_"+pairSelect.asset+"></span></td><td id=prc_"+pairSelect.asset+"></td></tr>";
    }
    htmlPrintAmount+= "</table>";

    document.getElementById('wallet').innerHTML = htmlPrintAmount;

    localStorage.setItem("coinTrack", JSON.stringify(cryptoWallet));

    setInterval(updateAsset,3000,cryptoWallet);
}

// recalcula los valores en tenencia y escribe el valor en el objeto html respectivo
function updateAsset(cryptoWallet) {

    for (const pairSelect of cryptoWallet) {

        actualChg = $('#achg_'+pairSelect.asset).html();
        $('#wchg_'+pairSelect.asset).html(actualChg);

        if (actualChg >=0) {
            $('#wchg_'+pairSelect.asset).css("color", "white")
                                       .css("background-color", "green");
        } else {
            $('#wchg_'+pairSelect.asset).css("color", "white")
                                       .css("background-color", "red");
        }

        actualPrice = $('#a_'+pairSelect.asset).html();
        $('#prc_'+pairSelect.asset).html(actualPrice); 
        document.getElementById('w_'+pairSelect.asset).innerHTML = pairSelect.calcAmount(document.getElementById('a_'+pairSelect.asset).innerHTML);
    }
    calcPercentage(cryptoWallet);

/* funcion grafica estadistica proxima version

    if (trendDataFlag) {
        for (const cryptoWalletItem of cryptoWallet) {
            getTrendData(cryptoWalletItem.asset,30)
            
        }
        trendDataFlag = false
        plotTrendData(trendDataArray);
    }

*/

}

function calcPercentage(cryptoWallet) {

    const dataGraph = [];
    const labelGraph = [];
    let usdt=0.00;
    let usdtTotal=0.00;
    let index=0;

    for (const pairSelectUSDT of cryptoWallet) {
        usdt=parseFloat(pairSelectUSDT.amountUSDT);
        usdtTotal=usdtTotal+usdt;
    }

    for (const pairSelectUSDT of cryptoWallet) {
        usdt=parseFloat(pairSelectUSDT.amountUSDT);
        usdtPercent = (usdt * 100 / usdtTotal).toFixed(2);
        
        document.getElementById('u_'+pairSelectUSDT.asset).innerHTML = usdtPercent+"%";
        
        dataGraph[index] = parseFloat(usdtPercent);
        labelGraph[index] = pairSelectUSDT.asset.substring(3,0);
        index++;

    }
    usdtTotal=usdtTotal.toFixed(2);
    $('#usdt').html(usdtTotal+" USDT");
    myChart.data.datasets[0].data = dataGraph;
    myChart.data.labels = labelGraph;
    myChart.update();

}

// funcion que ordena por nombre de par en el array de objetos que se obtine del exchange y retorna el array ordenado.
function sortAssets(parCrypto) {

    parCrypto = parCrypto.filter( assetUSDT => assetUSDT.symbol.substring(assetUSDT.symbol.length - 4) == "USDT");

    parCrypto = (parCrypto.sort(
        function(a,b){
            if ( a.symbol < b.symbol )
                return -1;
            if ( a.symbol > b.symbol )
                return 1;
            return 0;
        }
    )
    );
    return(parCrypto);
}

// Metodo para verificar campos en form de tenencias, sino inhabilita el boton TRACK
function verifyInput(formTest, typeForm, buttonID) {

    if (typeForm == "assetValues") {

        const regularExpression = (/^[0-9]{1,}[.]{0,}[0-9]{0,8}$/);

        for (let indexField=0; indexField<listPairs.length;indexField++) {

            if (formTest[indexField].value > 0 ) {
                if (regularExpression.test(listPairs[indexField].value)) {
                    document.getElementById("messages").innerHTML = "<p class='text-primary'>Ingrese sus tenencias y presione [TRACK]</p>";
                    document.getElementById(buttonID).disabled = false;
                } else {
                    document.getElementById("messages").innerHTML = "<p>Error en la carga: Valor mayor a 0 ej: 0.00000001<p>";
                    document.getElementById(buttonID).disabled = true;
                    return false;
                } 
            } else {
                document.getElementById("messages").innerHTML = "<p>Error en la carga: Valor mayor a 0 ej: 0.00000001</p>";
                document.getElementById(buttonID).disabled = true;
                return false;
            } 
        }
    } else  {
        for (let indexField=0; indexField<formCheckPairs.length;indexField++) {
            if (formCheckPairs[indexField].checked) {
                document.getElementById('initButton').disabled = false;
                return false;
            } else {
                document.getElementById('initButton').disabled = true;
            }
        }
    }
}

function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}

function restoreSession() {
    const cryptoWalletLSession = JSON.parse(localStorage.getItem("coinTrack"));
    return(cryptoWalletLSession);
}

function toggleDivs(divToHide) {

    if (divToHide=="pairs") {
        if ($('#pairs').is(":visible")) {
            $('#nav-title').hide("slow")
            $('#pairs').delay(500)
                       .slideUp("slow")
                       .hide("slow");
            $('#buttonPairs').html("Show Cryptos");
        } else {
            $('#nav-title').show("slow");
                           
            $('#pairs').delay(500)
                       .slideDown("slow");

            $('#buttonPairs').html("Hide Cryptos");
        }
    } 
    else if (divToHide=="graph") {
        if ($('#graphDiv').is(":visible")) {
            $('#graphDiv').hide("slow");
            $('#buttonGraph').html("Show Graph");
        } else {
            $('#graphDiv').show("slow");
            $('#buttonGraph').html("Hide Graph");
        }
    }
}

function searchAssets(reset) {
    if (reset == "reset") {
        $('#searchAssetsBox').val("");
    }
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("searchAssetsBox");
    filter = input.value.toUpperCase();
    table = document.getElementById("listAssets");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            txtValue = td.textContent || td.innerText;
            if (txtValue.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }       
    }
}

/* funcion grafica estadistiva proxima version 

function getTrendData(crypto,limit) {

    let trendData;

    const apiURLBinance = "https://api.binance.com/api/v1/klines?symbol="+crypto+"&interval=1d&limit="+limit;
    console.log(apiURLBinance);
    $.ajax({
        dataType: "json",
        method: "GET",
        url: apiURLBinance,
        success: function(apiTrendData) {
            trendData = apiTrendData;
            trendDataArray.push(trendData);
            console.log(trendDataArray);
        }
    })

}

function plotTrendData(dataGraph) {

    myTrendChart.data.data = dataGraph;
    //myTrendChart.data.labels = labelGraph;
    myTrendChart.update();

}

*/