"use strict"
import { fetchProducts } from "./functions";
import { fetchCategories } from "./functions";
import { saveVote, getVotes } from "./firebase";

/*(() => {
    alert("¡Bienvenido a la página!");
    console.log("Mensaje de bienvenida mostrado.");
})();*/
/**
 * Muestra un elemento toast (notificación) en pantallas medianas y superiores.
 * Busca el elemento con id "toast-interactive" y le añade la clase "md:block" 
 * de TailwindCSS para hacerlo visible en breakpoints md (≥768px).
 * 
 * @function showToast
 * @returns {void} No retorna ningún valor
 * @example
 * // Mostrar el toast al cargar la página
 * showToast();
 */


const showToast = () => {
    const toast = document.getElementById("toast-interactive");
    if (toast) {
        toast.classList.add("md:block");
    }
};
/**
 * Configura un event listener en el elemento demo para abrir un video de YouTube.
 * Cuando se hace clic en el elemento con id "demo", abre el video especificado
 * en una nueva pestaña del navegador.
 * 
 * @function showVideo
 * @returns {void} No retorna ningún valor
 * @example
 * // Configurar el click handler para el demo
 * showVideo();
 * 
 * @see {@link https://youtu.be/KBW7m4XsZKs?si=D3ttauF4iWC2YK1k|Video de demostración}
 */
const showVideo = () => {
    const demo = document.getElementById("demo");
    if (demo) {
        demo.addEventListener("click", () => {
            window.open("https://youtu.be/KBW7m4XsZks?si=D3ttauF4iWC2YKlk", "_blank");
        });
    }
};

let renderProducts = () => {
    fetchProducts('https://data-dawm.github.io/datum/reseller/products.json')
        .then(result => {
            if(result.success){
                let container = document.getElementById("products-container");
                container.innerHTML = "";
                let products = result.body.slice(0,6);
                products.forEach(product => {
                    let productHTML = `
   <div class="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow">
       <img
           class="w-full h-40 bg-gray-300 dark:bg-gray-700 rounded-lg object-cover transition-transform duration-300 hover:scale-[1.03]"
           src="[PRODUCT.IMGURL]" alt="[PRODUCT.TITLE]">
       <h3
           class="h-6 text-xl font-semibold tracking-tight text-gray-900 dark:text-white hover:text-black-600 dark:hover:text-white-400">
           $[PRODUCT.PRICE]
       </h3>

       <div class="h-5 rounded w-full">[PRODUCT.TITLE]</div>
           <div class="space-y-2">
               <a href="[PRODUCT.PRODUCTURL]" target="_blank" rel="noopener noreferrer"
               class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 w-full inline-block">
                   Ver en Amazon
               </a>
               <div class="hidden"><span class="1">[PRODUCT.CATEGORY_ID]</span></div>
           </div>
       </div>
   </div>`;

                    productHTML = productHTML.replaceAll("[PRODUCT.TITLE]", product.title.length > 20 ? product.title.substring(0, 20) + "..." : product.title);
                    productHTML = productHTML.replaceAll("[PRODUCT.PRICE]", product.price);
                    productHTML = productHTML.replaceAll("[PRODUCT.IMGURL]", product.imagurl);
                    productHTML = productHTML.replaceAll('[PRODUCT.CATEGORY_ID]', product.category_id);
                    productHTML = productHTML.replaceAll("[PRODUCT.PRODUCTURL]", product.producturl);
                    
                    // 5d.iii. Concatenar al container usando innerHTML
                    container.innerHTML += productHTML;
                });

                
            } else{
                alert("Error al cargar productos" + result.body);
            };
        });
};

let renderCategories = async () => {
    try{
        let result = await fetchCategories('https://data-dawm.github.io/datum/reseller/categories.xml');
        if(result.success){
            let container = document.getElementById('categories');
            container.innerHTML = `<option selected disabled>Seleccione una categoría</option>`;
            let categoriesXML = result.body;
            let categories = categoriesXML.getElementByTagName('category');
            for(let category of categories){
                let categoryHTML = `<option value="[ID]">[NAME]</option>`;
                let id = category.getAttribute('id');
                let name = category.textContent;
                categoryHTML = categoryHTML.replaceAll('[ID]', id);
                categoryHTML = categoryHTML.replaceAll('[NAME]', name);
                container.innerHTML += categoryHTML;
            }
        }else{
            alert('Error al cargar categorías: ' + result.body);
        }
    } catch{
        alert('Error inesperado: ' + error.message);
        
    }
};

const enableForm = () => {
    const formulario = document.getElementById("form_voting");
    formulario.addEventListener("submit", async (event) => {
        event.preventDefault();
        const select = document.getElementById("select_product");
        const valor = select.value;
        const result = await saveVotes(valor);
        alert(result.message);
    });
};
const displayVotes = async () => {
  let tableHTML = `
    <table border="1" cellpadding="5" cellspacing="0">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Total de votos</th>
        </tr>
      </thead>
      <tbody>
  `;

  try {
    const response = await getVotes();

    if (!response.status) {
      tableHTML += `<tr><td colspan="2">${response.message}</td></tr>`;
    } else {
      const data = response.data;
      const counts = {};

      for (const [key, value] of Object.entries(data)) {
        if (value.productID) {
          const id = value.productID;
          counts[id] = (counts[id] || 0) + 1;
        } else if (typeof value === "object") {
          let subcount = 0;
          for (const subKey of Object.keys(value)) {
            if (subKey !== "date") subcount++;
          }
          counts[key] = (counts[key] || 0) + subcount;
        }
      }
      for (const [product, total] of Object.entries(counts)) {
        tableHTML += `
          <tr>
            <td>${product}</td>
            <td>${total}</td>
          </tr>
        `;
      }

      if (Object.keys(counts).length === 0) {
        tableHTML += `<tr><td colspan="2">No hay votos aún</td></tr>`;
      }
    }

    tableHTML += `
        </tbody>
      </table>
    `;

    const resultados = document.getElementById("results");
    resultados.innerHTML = tableHTML;

  } catch (error) {
    console.error(error);
    alert("Error al mostrar los resultados");
  }
};


(() => {
    showToast();
    showVideo();
    renderProducts();
    renderCategories();
    enableForm();
    displayVotes();
})();