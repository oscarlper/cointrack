// variable de id de Interval al metodo callBinance
var idInterval;
var assetToCalc = [];

let orderEvent = document.getElementById("sortedAssets");

var mode = "listAssets";

orderEvent.onclick = () => {populatePairs(parCrypto, mode)};


var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
      datasets: [{
      label: '% Amount USDT',
      data: [0],
      backgroundColor: [
        'rgba(75, 75, 100, .8)',
        'rgba(75, 75, 150, .8)',
        'rgba(75, 75, 200, .8)',
        'rgba(75, 75, 250, .8)'
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

    if (mode == "listAssets") {
        document.getElementById('wallet').innerHTML = "<h6>Seleccione los pares en el panel izquierdo y luego presione [INIT]</h6><button class='btn btn-primary' id='initButton' onclick='idInterval=trackInit(true)'>INIT</button>";
        document.getElementById('initButton').disabled = true;
    }

     let htmlPrintPairs = "<form id='formCheckPairs'><table class='table table-dark table-striped text-white'><option>";

     if (document.getElementById('sortedAssets').checked) {
        parCrypto=sortAssets(parCrypto);
    }

    for (const assetBinance of parCrypto.filter( assetUSDT => assetUSDT.symbol.substring(assetUSDT.symbol.length - 4) == "USDT")) {
        //symbolUSDT = assetUSDT.symbol.substring(assetUSDT.symbol.length - 4)
        //console.log(mode);
        if (mode != "run") {
            htmlPrintPairs+= "<tr><td><input type='checkbox' id="+assetBinance.symbol+" onclick=verifyInput()>&nbsp&nbsp<label class=fs-7>"+assetBinance.symbol+"</label></td><td id=a_"+ assetBinance.symbol+ "></td></tr>";
        } else {
            htmlPrintPairs+= "<tr><td><p class=fs-7>"+assetBinance.symbol+"<p></td><td class=fs-7 id=a_"+ assetBinance.symbol+ ">"+assetBinance.lastPrice+"</td></tr>";
        }
    }
    htmlPrintPairs+= "</option></form></table>";

    document.getElementById('pairs').innerHTML = htmlPrintPairs;

}

// metodo que lee los assets seleccionados mediante checkbox
function readSelectedAssets(parCrypto) {

    itemInitValue = 0.00000000;

    let cryptoWalletLSession = restoreSession();

    const pairsSelected = [];

    let htmlPrintPairs = "<form class='form-control-sm text-white' id=listPairs><table class='fs-7 text-white'><tr><th>Asset</th><th>Amount</th></tr>";

    for (const assetBinance of parCrypto.filter( assetUSDT => assetUSDT.symbol.substring(assetUSDT.symbol.length - 4) == "USDT")) {
        if (document.getElementById(assetBinance.symbol).checked == true) {

            for (const cryptoWalletItem of cryptoWalletLSession){
                
                if (cryptoWalletItem.asset == assetBinance.symbol) {
                    itemValue = cryptoWalletItem.amount;
                    break;
                } else {
                    itemValue = itemInitValue;
                }
            }

            console.log(itemValue);

            htmlPrintPairs+= "<tr><td><label>"+assetBinance.symbol+"&nbsp&nbsp</label></td>";
            htmlPrintPairs+= "<td><input value="+itemValue+" class='testField form-control' id=w_"+assetBinance.symbol+" type='text' onfocusout=verifyInput(listPairs,'assetValues','trackButton')></td>";
            htmlPrintPairs+= "<td id="+ assetBinance.symbol+ "></td>";
            htmlPrintPairs+= "</tr>";

            assetToCalc.push(assetBinance.symbol);
        }
    }
    htmlPrintPairs+= "</table><br><button id=trackButton class='btn btn-primary mb-5' onclick='trackAsset(mode)'>Track</button></form>";
    htmlPrintPairs+= "<h6><p id=messageForm class='text-warning'></p><h6>"
    htmlPrintPairs+= "<h6>Ingrese sus tenencias y presione [TRACK]</h6>";

    document.getElementById('wallet').innerHTML = htmlPrintPairs;
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

    document.getElementById('graph').innerHTML = null;

    var amountAtUSDT;

    var totalUSDT;

    let htmlPrintAmount = "<table class='table table-dark table-striped text-white fs-7' ><tr><th>Asset</th><th>%</th><th>USDT</th></tr>";

    class cryptoClass {
        constructor(asset,amount) {
            this.asset = asset;
            this.amount = parseFloat(amount);
            this.amountUSDT;
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
        htmlPrintAmount+= "<tr><td>"+pairSelect.asset+"</td><td id=u_"+pairSelect.asset+"></td><td id=w_"+pairSelect.asset+">"+pairSelect.calcAmount(document.getElementById('a_'+pairSelect.asset).innerHTML)+"</td></tr>";
    }
    document.getElementById('wallet').innerHTML = htmlPrintAmount;
    htmlPrintAmount+= "</table>";

    localStorage.setItem("coinTrack", JSON.stringify(cryptoWallet));

    setInterval(updateAsset,3000,cryptoWallet);
}

// recalcula los valores en tenencia y escribe el valor en el objeto html respectivo
function updateAsset(cryptoWallet) {

    for (const pairSelect of cryptoWallet) {
        document.getElementById('w_'+pairSelect.asset).innerHTML = pairSelect.calcAmount(document.getElementById('a_'+pairSelect.asset).innerHTML);
    }
    calcPercentage(cryptoWallet);
}

function calcPercentage(cryptoWallet) {

    const dataGraph = [];
    const labelGraph = [];
    let usdt=0.00;
    let usdtTotal=0.00;
    let index=0;
    //let indexColor=0;

    //console.log(cryptoWallet);

    for (const pairSelectUSDT of cryptoWallet) {
        usdt=parseFloat(pairSelectUSDT.amountUSDT);
        usdtTotal=usdtTotal+usdt;
    }

    for (const pairSelectUSDT of cryptoWallet) {
        usdt=parseFloat(pairSelectUSDT.amountUSDT);
        usdtPercent = (usdt * 100 / usdtTotal).toFixed(2);
        //if (indexColor==4) { indexColor=0; };
        //colorChart = myChart.data.datasets[0].backgroundColor[indexColor];
        //console.log("Index: "+indexColor+" Color: "+ colorChart);
        //document.getElementById('u_'+pairSelectUSDT.asset).innerHTML = "<p style='color:"+colorChart+";'>"+usdtPercent+" %</p>";
        document.getElementById('u_'+pairSelectUSDT.asset).innerHTML = usdtPercent+" %";
        index++;
        //indexColor++;
        dataGraph[index] = parseFloat(usdtPercent);
        labelGraph[index] = pairSelectUSDT.asset.substring(3,0);
        //console.log(usdt);
    }

    myChart.data.datasets[0].data = dataGraph;
//    myChart.data.datasets[0].data = [5,30,40,5,20]
//    myChart.data.labels = ['AD']
//    myChart.data.labels = labelGraph;
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

        for (let indexField=0; indexField<formTest.length-1;indexField++) {

            if (regularExpression.test(formTest[indexField].value)) {
                document.getElementById("messageForm").innerHTML = "";
                document.getElementById(buttonID).disabled = false;
            } else {
                document.getElementById("messageForm").innerHTML = "Error en la carga";
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
    console.log(cryptoWalletLSession);
    return(cryptoWalletLSession);
}