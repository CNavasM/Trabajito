var nodes = null;
var edges = null;
var network = null;

var vertices = [];
var aristas_from  = [];
var aristas_to = [];
var peso = [];
var pesoAux = [];
var mAdyacencia = [];
var mCaminos = []
var a_desde = [];
var a_hacia = [];
var contador = 1;

// randomly create some nodes and edges
var data = getScaleFreeNetwork(25);
var seed = 2;
var defaultLocal = navigator.language;
var select = document.getElementById('locale');

function destroy() {
  if (network !== null) {
    network.destroy();
    network = null;
  }
}

function draw() {
  destroy();
  nodes = [];
  edges = [];
  // create a network
  var container = document.getElementById('resultado');
  var options = {
    layout: {randomSeed:seed}, // just to make sure the layout is the same when the locale is changed
    locale: document.getElementById('locale').value,
    manipulation: {
      addNode: function (data, callback) {
      // filling in the popup DOM elements
        document.getElementById('node-operation').innerHTML = "Agregar Vértice";
        editNode(data, clearNodePopUp, callback);
      },
      editNode: function (data, callback) {
        // filling in the popup DOM elements
        document.getElementById('node-operation').innerHTML = "Editar Vértice";
        editNode(data, cancelNodeEdit, callback);
      },
      addEdge: function (data, callback) {
        if (data.from == data.to) {
          var r = confirm(`
            ¿ Deseas conectar el vértice a sí mismo ? 
            pd: Crearás un bucle !
          `);
          if (r != true) {
            callback(null);
            return;
          }
        }
        var tipoGrafo = document.querySelector("#tipoGrafo").value;
        if(tipoGrafo === 'Dirigido'){
          var options = {
            edges:{
              arrows: 'to',
            }
          }
          network.setOptions(options);
        }
        document.getElementById('edge-operation').innerHTML = "Agregar Arista";
        editEdgeWithoutDrag(data, callback);
      },
      editEdge: {
        editWithoutDrag: function(data, callback) {
              document.getElementById('edge-operation').innerHTML = "Editar Arista";
              editEdgeWithoutDrag(data,callback);
            }
          }
          
        }
      };
      network = new vis.Network(container, data, options);
      
    }

    function editNode(data, cancelAction, callback) {
      document.getElementById('node-label').value = data.label;
      document.getElementById('node-saveButton').onclick = saveNodeData.bind(this, data, callback);
      document.getElementById('node-cancelButton').onclick = cancelAction.bind(this, callback);
      document.getElementById('node-popUp').style.display = 'block';
    }

    // Callback passed as parameter is ignored
    function clearNodePopUp() {
      document.getElementById('node-saveButton').onclick = null;
      document.getElementById('node-cancelButton').onclick = null;
      document.getElementById('node-popUp').style.display = 'none';
    }

    function cancelNodeEdit(callback) {
      clearNodePopUp();
      callback(null);
    }

    function saveNodeData(data, callback) {
      data.id = document.getElementById('node-id').value;
      data.label = document.getElementById('node-id').value;
      vertices.push(data.id);
      clearNodePopUp();
      callback(data);
    }

    function editEdgeWithoutDrag(data, callback) {
      // filling in the popup DOM elements
      // document.getElementById('edge-label').value = data.label;
      document.getElementById('edge-saveButton').onclick = saveEdgeData.bind(this, data, callback);
      document.getElementById('edge-cancelButton').onclick = cancelEdgeEdit.bind(this,callback);
      document.getElementById('edge-popUp').style.display = 'block';
    }

    function clearEdgePopUp() {
      document.getElementById('edge-saveButton').onclick = null;
      document.getElementById('edge-cancelButton').onclick = null;
      document.getElementById('edge-popUp').style.display = 'none';
    }

    function cancelEdgeEdit(callback) {
      clearEdgePopUp();
      callback(null);
    }

    function saveEdgeData(data, callback) {
      if (typeof data.to === 'object')
        data.to = data.to.id;
       
      if (typeof data.from === 'object')
        data.from = data.from.id;
  
      data.label = document.getElementById('edge-label').value;
      aristas_from.push(data.from);
      aristas_to.push(data.to);
      peso.push(data.label);
      
      clearEdgePopUp();
      callback(data);
    }

    function init() {
      setDefaultLocale();
      draw();
    }

    

    //a. matriz de caminos y grafo conexa o no
    function buscar(columna,fila){
      var tipoGrafo = document.querySelector("#tipoGrafo").value;
      for(let i=0; i<(aristas_from.length);i++){
        if(tipoGrafo === 'Dirigido'){
          if(columna===aristas_from[i] && fila===aristas_to[i])
              return 1;
        }else{
          if(columna===aristas_from[i] && fila===aristas_to[i] || columna===aristas_to[i] &&  fila===aristas_from[i])
            return 1;
        }
        }
    }
  
    function MatrizAdyacencia(){
      var mAdyacencia = []
      var aux = []; // columnas
      for(let i=0; i<vertices.length;i++){
        for(let j=0; j<vertices.length;j++){
          if(buscar(vertices[i],vertices[j])===1){
            aux.push(1);
          }
          else{
            aux.push(0);
          }   
        }
        mAdyacencia[i]=aux;
        aux=[];
      }
      return mAdyacencia;
    }

    function multiplicarMatriz(matriz1, matriz2,matrizF){
      var suma=0, maux = []; //
      for(let i=0; i<vertices.length;i++){ //avanza por las filas de la matriz1
        for(let j=0; j<vertices.length;j++){ //avanza por las columnas de las matriz2
          for(let k=0; k<vertices.length;k++){ 
              suma+=matriz1[i][k] * matriz2[j][k];
          }
        maux.push(suma);
        suma=0;
        }
      matrizF[i]=maux;
      maux=[];
      }
    }

    function sumarMatrices(matriz1, matriz2, matrizF){
      var maux=[];
      for(let i=0; i<vertices.length;i++){
        for(let j=0; j<vertices.length;j++){
          maux.push(matriz1[i][j]+matriz2[i][j]);
        }
        matrizF[i]=maux;
        maux=[];
      }
    }

    function Conexo(matriz){
      var  cont=0;
      for(let i=0; i<vertices.length;i++){
        for(let j=0; j<vertices.length;j++){
          if(matriz[i][j]===0){
            cont++;
          }
        } 
      }
      if(cont===0)
        return true;
      else
        return false;
    }

    function MatrizCaminos(mAdyacencia){
      var mCaminos = [], mMultiplicada=[], mSuma=[]=mAdyacencia ,aux = mAdyacencia;
      for(let i=0; i<((vertices.length)-1);i++){
        multiplicarMatriz(mAdyacencia,aux,mMultiplicada);
      }
      sumarMatrices(mMultiplicada,mSuma,mCaminos);
      aux=mMultiplicada;
      // Conexo(mCaminos);
      return mCaminos;
    }
    /*---------------------------------------------------------------------------------------------------
                                    Funciones para el item de flujo maximo
    -----------------------------------------------------------------------------------------------------
     */
    function buscarPeso(columna,fila){
      for(let i=0; i<aristas_from.length ;i++){
        if(columna===aristas_from[i] && fila===aristas_to[i]){
          return peso[i];
        }
      }
    }

    function MatrizDePeso(){ 
      var mPeso = [];
      var aux = []; // columnas
      for(let i=0; i<vertices.length;i++){
        for(let j=0; j<vertices.length;j++){
          if(buscar(vertices[i],vertices[j])===1){
            aux.push(buscarPeso(vertices[i],vertices[j]));
          }
          else{
            aux.push(0);
          }    
        }
        mPeso[i]=aux;
        aux=[];
      }
      return mPeso;
    }

    function bfs(matrizR,s,t,parent){
      var visitado = [],cola = [];
      //arreglo que marca si todos los vértices son o no visitados
      for(let i=0; i<vertices.length ; i++){
        visitado[i]=false;
      }
      //la "cola" almacena el vertice de origen y si es visitado o no
      cola.push(s);
      visitado[s]=true;
      parent[s]= -1;
      //algoritmo "Breadth-first search"
      while(cola.length != 0){
        var aux = cola.shift();
        for(let i=0; i<vertices.length; i++){
          if(visitado[i]==false && matrizR[aux][i]>0){
            cola.push(i);
            parent[i]=aux;
            visitado[i]=true;
          }
        }
      }
      //true si el vertice destino es encontrado
      console.log(`Visitado[${t}]: ${visitado[t]}`);
      return (visitado[t] == true);
      
    }

    //algoritmo FordFulkerson, retorna el flujo maximo
    function algoritmoFlujoMaximo(matriz,s,t){
      var matrizResidual=matriz;
      //arreglo que almacena las rutas
      var parent = new Array(vertices.length);
      var flujo=0 , aux ,v;
    
      //aumentar el flujo mientras exista un camino
      while(bfs(matrizResidual,s,t,parent)){
        //encuentra la capacidad minima residual de las aristas
        var flujoMax = Number.MAX_VALUE;
        for(var v=t; v!=s; v = parent[v]){
          aux = parent[v];
          flujoMax = Math.min(flujoMax, matrizResidual[aux][v]);
        }
        //actualiza la capacidad residual de las aristas 
        for(v=t; v!=s; v=parent[v]){
          aux = parent[v];
          matrizResidual[aux][v] -= flujoMax;
          matrizResidual[v][aux] += flujoMax;
        }
        flujo += flujoMax;
        console.log(`Flujo: ${flujo}`);
      }
      return flujo;
    }

    
    
    /*---------------------------------------------------------------------------------------------------
                                    Funcion quue dibuja matrices
    -----------------------------------------------------------------------------------------------------
     */
    
    function dibujarMAtriz(matriz){
      //creo los elementos y llamo a la tabla del html
      var tabla_padre = document.createElement('table');
      var fila = document.createElement('tr');
      var primero = document.createElement('td');
      primero.textContent = "-";
      primero.style.backgroundColor="#cfd8dc";
      primero.style.textAlign="center";
      primero.style.width="40px";
      primero.style.height="40px";
      fila.appendChild(primero);
      //for para agregar los valores de la primera fila
      for(let i=0 ; i<vertices.length; i++){
        var p_fila = document.createElement('td');
        p_fila.style.width="40px";
        p_fila.style.height="40px";
        p_fila.style.textAlign="center";
        p_fila.style.backgroundColor="#cfd8dc";
        p_fila.textContent = vertices[i];
        fila.appendChild(p_fila);
      }
      tabla_padre.appendChild(fila);

      for(let k=0; k<matriz.length ;k++){
        //se agrega el nombre de los vertices (en la primera columna)
        var o_filas = document.createElement('tr');
        var nombre = document.createElement('td');
        nombre.style.width="40px";
        nombre.style.height="40px";
        nombre.style.backgroundColor="#cfd8dc";
        nombre.style.textAlign="center";
        nombre.textContent = vertices[k];
        o_filas.appendChild(nombre);

        for(let j=0; j<matriz.length ;j++){
          //se agregan los datos contenidos en la matriz
          var datos = document.createElement('td');
          datos.style.width="40px";
          datos.style.height="40px";
          datos.style.textAlign="center";
          datos.textContent = matriz[k][j];
          o_filas.appendChild(datos); 
        }
        tabla_padre.appendChild(o_filas);
      }
      return tabla_padre;
    }


    /*---------------------------------------------------------------------------------------------------
                                    funciones 
    -----------------------------------------------------------------------------------------------------
     */

    function item_MatrizCamino(){
      const boton = document.querySelector("#item1");
      //dibuja la matriz de adyacencia
      const padreAdy= document.querySelector("#matrizAdy");
      var matriz = MatrizAdyacencia();
      padreAdy.appendChild(dibujarMAtriz(matriz));
      //dibuja la matriz de caminos
      var MAdyacencia= MatrizAdyacencia()
      const padreCam = document.querySelector("#matrizCam");
      matriz_c = MatrizCaminos(MAdyacencia, mCaminos);
      padreCam.appendChild(dibujarMAtriz(matriz_c));
      //es o no conexo
      const esConexo = document.querySelector("#esConexo");
      var es_conexo = Conexo(matriz_c);
      if(es_conexo)
        esConexo.textContent = "es Conexo";
      else
        esConexo.textContent = "no es Conexo";
      boton.disabled= true;
    }


    /*---------------------------------------------------------------------------------------------------
                                    funciones para el item 3
    -----------------------------------------------------------------------------------------------------
     */
    function pares(arista1,arista2,matriz_pares){
      var tipoGrafo = document.querySelector("#tipoGrafo").value;
      console.log(tipoGrafo)
      var indice=arista1.length, matriz_aux = []
      for(let i=0; i<indice;i++){
        matriz_aux.push(arista1[i])
        matriz_aux.push(arista2[i])
        matriz_pares[i]=matriz_aux
        matriz_aux=[]
      }
      console.log(matriz_aux)
      if(tipoGrafo === "Simple"){
        var len = matriz_pares.length -1
        for(let j=0; j<indice;j++){
          console.log(arista2[j],arista1[j])
          matriz_aux.push(arista2[j])
          matriz_aux.push(arista1[j])
          console.log(matriz_aux)
          len++
          matriz_pares[len]=matriz_aux
          matriz_aux=[]
        }
      }
      console.log(matriz_pares)
    }
    function Buscar(matriz, nodo, matriz_ncaminos){
      var indice=0
      for(let i=0; i<matriz.length;i++){
        if(nodo===matriz[i][0]){
          var k = matriz[i].length
          matriz_ncaminos[indice]=matriz[i][k-1]
          indice++
        }
      }
      matriz_ncamino=[]
    }
    function JuntarMatrices(matriz1, matriz2, matriz_final){
      for(let i=0; i<matriz1.length;i++){
        matriz_final.push(matriz1[i])
      }
      for(let j=0; j<matriz2.length;j++){
        matriz_final.push(matriz2[j])
      }
    }
    //
    function Caminos(n1, n2){
      var matriz_caminos = [], nodo_b
      const a1 = aristas_from, a2 = aristas_to
      var matriz_pares = [], matriz_aux = [], matriz_aux2= [], matriz_aux3 = []
      pares(a1,a2,matriz_pares)
      matriz_caminos = matriz_pares
      var contador=0
      do{
        var cont=0 //para ver cuantas filas nuevas se agregaron 
        var aux=matriz_caminos.length
        for(let i=contador; i<aux;i++){
          var j = matriz_caminos[i].length //j - 1 = ultima arista en la lista
          nodo_b = matriz_caminos[i][j-1] //nodo que buscamos
          Buscar(matriz_pares, nodo_b, matriz_aux)
          if(matriz_aux!==[]){
            if(matriz_aux.length===1){
              JuntarMatrices(matriz_caminos[i],matriz_aux,matriz_aux2)
              matriz_caminos.push(matriz_aux2)
              cont++
            }
            else{
              for(let j=0; j<matriz_aux.length;j++){ //cuando se repite mas de una vez un nodo en la lista de pares
                JuntarMatrices(matriz_caminos[i],matriz_aux[j],matriz_aux2)
                matriz_aux3[j]=matriz_aux2
                cont++
               matriz_aux2 = [], matrix_aux= []
              }
              for(let h=0; h<matriz_aux3.length;h++){
                matriz_caminos.push(matriz_aux3[h])
              }
              matriz_aux3=[]
            }
          }
          matriz_aux=[], matriz_aux2=[]
        }
        contador=aux
        aux=aux+cont
      }while(cont!==0)
      return matriz_caminos
    }
    function buscarCamino(nodo1, nodo2, matriz_caminos){
      var caminos = [], aux = [], cont = 0
      for(let i=0; i<matriz_caminos.length;i++){
        var matriz=matriz_caminos[i], k=matriz.length
        if(matriz[0]===nodo1 && matriz[k-1]===nodo2){
          caminos[cont] = matriz
          cont++
        }
      }
      return caminos
    }
    //funcion para calcular los pesos de la matriz_caminos
    function calcularPeso(matriz_caminos){
      var camino_corto = [], aux = [] 
      for(let i=0; i<matriz_caminos.length;i++){
        var matriz = matriz_caminos[i]
        for(let j=1; j<matriz.length;j++){
          var peso = buscarPeso(matriz[j-1],matriz[j]), lar = peso.length
          if(peso===0){
            peso=1
          }
          aux.push(peso[lar-1])
        }
        camino_corto[i] = aux
        aux = []
      }

      return camino_corto
    }
    function sumarMatriz(matriz){ //peso_caminos = [1,2,3], suma = 6
      var suma = 0
      for(let i=0; i<matriz.length;i++){
        var str = matriz[i], num = parseInt(str)
        suma = suma + num
        console.log(suma)
      }
      return suma
    }
    function compararPesos(matriz_caminos, peso_caminos){
      var peso, indice = 0, peso_menor = sumarMatriz(peso_caminos[0])  //peso menor = (indice,peso)
      for(let i=0; i<matriz_caminos.length;i++){
        peso = sumarMatriz(peso_caminos[i])
        console.log("peso",peso)
        if(peso < peso_menor){
          peso_menor=peso
          indice = i
          console.log("peso",peso_menor)
        }
      }
      return indice
    }
    function CaminoCorto(nodo1, nodo2){ //caminos que empiecen en nodo1 y terminen en nodo2 guardados en matriz_final
      var matriz_final = [], indice//, matriz_caminos = [], peso_caminos = []
      matriz_final = Caminos(nodo1,nodo2)
      matriz_caminos = buscarCamino(nodo1,nodo2,matriz_final) //matriz_caminos -->> buscarCamino 
      peso_caminos = calcularPeso(matriz_caminos)  //
      indice = compararPesos(matriz_caminos, peso_caminos)
      return indice;
    }
    function item_CaminoCorto(){
      //llamo a los input de entrada y salida
      const entrada_cc = document.querySelector("#inputEntrada").value;
      const salida_cc = document.querySelector("#inputSalida").value; 
      const Camino_corto = document.querySelector("#Camino_corto");
      const boton2 = document.querySelector("#item2");
      var indice ,s,t;
      s = vertices.indexOf(entrada_cc);
      t = vertices.indexOf(salida_cc);
      if( s == -1 || t == -1 ){
        alert(`Error\nDebe ingresar vértices validos, que se hayan agregado a la hora de crear el grafo.\nIntentelo nuevamente.`);
      }else{
        indice = CaminoCorto(entrada_cc,salida_cc);
        var matrizCorta =  matriz_caminos[indice];
        var pesoCorto = peso_caminos[indice];
        console.log(matriz_caminos[indice], "---", peso_caminos[indice]);
        var cortito, aux=``;
        //muestra en html el camino mas corto
        for(let i=0; i<peso_caminos.length; i++){
          cortito =` ${matrizCorta[i]} --${pesoCorto[i]}-->`;
          aux += cortito;
        }
        aux+=`${matrizCorta[(matrizCorta.length-1)]}`;
        Camino_corto.textContent=aux;
        boton2.disabled=true;
      }
    }
    /*---------------------------------------------------------------------------------------------------
                                    funciones para el item 4
    -----------------------------------------------------------------------------------------------------
     */
     //// EULERIANO ////
 function gradopar(listagrado){           //Debe ser conexo 
  var par=0;                              // Todas las aristas de grado par
  for(let i=0; i<listagrado.length;i++){
    console.log(listagrado[i]%2)
    if((listagrado[i]%2) === 0)

      par++;
    }
  console.log("par",par)
  console.log(listagrado.length)
  if (par===listagrado.length)
    return true;
  else
    return false;
}
 function grado(matriz){ ///mostrará los grados de cada arista
  var listagrado = [], grado = 0;
  for(let i=0; i<matriz.length;i++){
    for(let j=0; j<matriz.length;j++){
      grado += matriz[i][j];
      console.log(grado)
    } 
    
    listagrado.push(grado);
    console.log(listagrado)
    grado=0;
  }
  console.log(gradopar(listagrado))
  if(gradopar(listagrado)===true)
    return true
  else
    return false
}
  function euleriano(){ //grado = largo, conexo = true
    var mAdyacencia = MatrizAdyacencia()
    var matriz_c = MatrizCaminos(mAdyacencia, mCaminos);
    console.log(mAdyacencia)
    console.log(Conexo(mAdyacencia))
    console.log(grado(mAdyacencia))
    if( grado(matriz_c)=== true && Conexo(mAdyacencia) === false){
      console.log("entro")
      return true
    }
    else
      return false
  }
    function item_euleriano(){
      const boton = document.querySelector("#item3");
      const esEu = document.querySelector("#esEu");
      var eu = euleriano();
      if(eu)
        esEu.textContent = "Es Euleriano";
      else
        esEu.textContent = "No es Euleriano";
      boton.disabled=true;
    }
    /*---------------------------------------------------------------------------------------------------
                                    funciones para el item 5
    -----------------------------------------------------------------------------------------------------
     */
    function item_FlujoMaximo(){
      //llamo a los input de entrada y salida
      var s,t;
      const boton4 = document.querySelector("#item4");
      const entrada = document.querySelector("#fm_Entrada").value;
      const salida = document.querySelector("#fm_Salida").value;
      var tipoGrafo = document.querySelector("#tipoGrafo").value;
      if(tipoGrafo === "Dirigido"){
        s = vertices.indexOf(entrada);
        t = vertices.indexOf(salida);
        if(s == -1 || t == -1){
          alert(`Error\nDebe ingresar vértices validos, que se hayan agregado a la hora de crear el grafo.\nIntentelo nuevamente.`);
        }else{
          var matrizpeso = MatrizDePeso();
          console.log("Matriz de distancia:");
          console.log(matrizpeso);
          var flujo_max = algoritmoFlujoMaximo(matrizpeso,s,t);
          const output = document.querySelector("#salida_FlujoMaximo");
          output.textContent = flujo_max;
          boton4.disabled=true;
        }
        
      }else{
        const alerta = document.querySelector("#alerta");
        alerta.textContent =`Sólo puede obtener el flujo máximo de un grafo dirigido`;
        alerta.className="alert alert-danger text-center";
      }
    }

    function item_ArbolGenerado(){
      const boton5 = document.querySelector("#item5");
      var opcion = document.querySelector("#tipoGrafo").value;
      var algoritmo_kruskal = Kruskal();
      const arKruskal = document.querySelector("#generarKruskal");
      const aristaEntrada = document.querySelector("#aEntrada");
      const aristaSalida = document.querySelector("#aSalida");
      arKruskal.textContent = algoritmo_kruskal;
      aristaEntrada.textContent = a_desde;
      aristaSalida.textContent = a_hacia;
      boton5.disabled=true;
    }

    

    
    

    
    
    
    

    


