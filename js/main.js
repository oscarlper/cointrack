// Get data de Binance Con AJAX Jquery //

let parCrypto = [];

// definir una clase u objeto ?
var trendDataArray = [];

const toGraphArray = [];

var trendDataFlag = true;

var pushArray=0;

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

    class CryptoClass {
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
        cryptoWallet.push(new CryptoClass(assetToCalc[i],parseFloat(document.getElementById('w_'+assetToCalc[i]).value)));
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

    var arrayTemp = [];

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

// funcion grafica estadistica proxima version

    if (trendDataFlag) {
        for (const cryptoWalletItem of cryptoWallet) {

            arrayTemp = getTrendData(cryptoWalletItem.asset,30);
        }
        trendDataFlag = false

    }

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

// metodo para agregar informacion al doughnut chart
function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}

// recupero los datos de la local storage
function restoreSession() {
    const cryptoWalletLSession = JSON.parse(localStorage.getItem("coinTrack"));
    return(cryptoWalletLSession);
}

// tooggle divs de monedas y graficas
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

// busca monedas con el campo search
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

/* recupero datos con la api de una moneda especifica y cantidad de dias */
function getTrendData(crypto,limit) {

    var trendData;
    var arrayTemp = [];
    var valueTemp;

    const apiURLBinance = "https://api.binance.com/api/v1/klines?symbol="+crypto+"&interval=1d&limit="+limit;
    $.ajax({
        dataType: "json",
        method: "GET",
        url: apiURLBinance,
        success: function(apiTrendData) {
            trendData = apiTrendData;

            for (const forArray of trendData) {
                valueTemp = parseFloat(forArray[4]);
                arrayTemp.push(valueTemp);
            }
        
            calcDataTrend(arrayTemp,crypto);
        }
    })

}

// calculo en base a los dato de la api el monto por dia de la moneda y lo acumulo en un array.
function calcDataTrend(arrayTemp,crypto){

    // arraytemp en valor del a crypto a 30 dias de historico. se almacena en arraytemp

    pushArray++;

    let itemValueGraph = 0;
    let tempGraphArray = [];
    
    const assetsToGraph = JSON.parse(localStorage.getItem("coinTrack"));
    let feedArrayFlag = assetsToGraph.length - 1;

    assets = assetsToGraph.length;
    
    // obengo el valor invertido en crypto se almacena en valueAsset
    for (const assetCalc of assetsToGraph) {
        if (assetCalc.asset == crypto) {
            valueAsset = assetCalc.amount;
        }
    }
    
    // multiplico el valor de arraytemp por el valor invertido, lo almaceno en un nuevo array tempGraphArray.    
    tempGraphArray.push(arrayTemp.map(function(xtemp) { return parseFloat(xtemp * valueAsset);}));

    toGraphArray.push(tempGraphArray);

    for (let i=0;i< toGraphArray[0][0].length; i++) {
        for (let j=0;j<toGraphArray.length;j++) {
            itemValueGraph = parseFloat(itemValueGraph) + parseFloat(toGraphArray[j][0][i]);  
            
            if (j==(feedArrayFlag)) {
                console.log(toGraphArray.length-1);
                trendDataArray.push(parseFloat(itemValueGraph));
            }
        }
        itemValueGraph = 0;
        
    }

    // si ya se obtuvieron todas las monedas y fueron calculadas grafico la tendencia diaria
    if (pushArray == assets) {
        console.log(trendDataArray);
        graficaTendencia(trendDataArray);
    }
}

// llamo a la libreria chart.js para graficar la tendencia diaria.
function graficaTendencia(dataToGraph) {
console.log("A GRAFICAR");
console.log(dataToGraph);
new Chart(document.getElementById("myTrendChart"), {
    type: 'line',
    data: {
      labels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30],
      datasets: [{
          data: dataToGraph,
          label: "Trending Chart Last 30 days",
          borderColor: "#3e95cd",
          fill: false
        }
      ]
    },
    options: {
      title: {
        display: true,
        text: ''
      }
    }
  });
}
