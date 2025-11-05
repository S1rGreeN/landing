"use strict"

let fetchProducts = async (url) => {


    
    return fetch(url)
        .then(response => {
            if(!response.ok){
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json
        })
        .then(data => {
            return{
                success:true,
                body:data
            };
        })
        .catch(error => {
            return{
                success: false,
                body: error.message
            }
        });
};

let fetchCategories = async (url) => {
    try{
        let response = await fetch(url);
        if(!response.ok){
                throw new Error(`Error HTTP: ${response.status}`);
        }
        
        let text = await response.text();
        const parser = new DOMParser();
        let data = parser.parseFromString(text, "application/xml");
        return {
            success: true,
            body: data
        }
        
    } catch (error){
        return {
            success: false,
            body: error.message
        }

    }
}
export { fetchProducts, fetchCategories }
