const pool = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
    return await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i 
             JOIN public.classification AS c 
             ON i.classification_id = c.classification_id 
             WHERE i.classification_id = $1`,
            [classification_id]
        );
        return data.rows;
    } catch (error) {
        console.error("getInventoryByClassificationId error: " + error);
        throw error; // Consider throwing the error to be handled at a higher level
    }
}

async function getInventoryByInvId(inv_id) {
    try {
        const data = await pool.query(
            `SELECT * FROM public.inventory AS i
             WHERE i.inv_id = $1`,
            [inv_id]
        );
        return data.rows;
    } catch (error) {
        console.error("getInventoryByInvId error: " + error);
        throw error; // Consider throwing the error to be handled at a higher level
    }
}

async function addClassification(classification_name) {
    try {
        const sql = "INSERT INTO public.classification (classification_name) VALUES ($1)";
        await pool.query(sql, [classification_name]);
    } catch (error) {
        console.error("Failed to add classification name: ", error);
        throw error; // Consider throwing the error to be handled at a higher level
    }
}

async function checkExistingName(classification_name) {
    try {
        const sql = "SELECT * FROM public.classification WHERE classification_name = $1";
        const name = await pool.query(sql, [classification_name]);
        return name.rowCount > 0; // Return boolean to indicate if it exists
    } catch (error) {
        console.error(error.message);
        return false; // Return false if there's an error
    }
}

async function addInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
) {
    try {
        const sql = `
            INSERT INTO public.inventory 
            (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
        
        const result = await pool.query(sql, [
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id
        ]);
        
        return result.rowCount; // Return the number of rows affected
    } catch (error) {
        console.error("Adding vehicle data failed: " + error);
        throw error; // Consider throwing the error to be handled at a higher level
    }
}

async function updateInventory(
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id,
    inv_id
) {
    try {
        const sql = `
            UPDATE public.inventory 
            SET inv_make = $1, inv_model = $2, inv_year = $3, inv_description = $4, 
                inv_image = $5, inv_thumbnail = $6, inv_price = $7, 
                inv_miles = $8, inv_color = $9, classification_id = $10 
            WHERE inv_id = $11 RETURNING *`;

        const data = await pool.query(sql, [
            inv_make,
            inv_model,
            inv_year,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_miles,
            inv_color,
            classification_id,
            inv_id
        ]);
        
        return data.rows[0]; // Return the updated row
    } catch (error) {
        console.error("Updating inventory failed: " + error);
        throw error; // Consider throwing the error to be handled at a higher level
    }
}

async function deleteInventory(inv_id) {
    try {
        const sql = "DELETE FROM public.inventory WHERE inv_id = $1";
        const data = await pool.query(sql, [inv_id]);
        return data.rowCount; // Return the number of rows affected
    } catch (error) {
        console.error("Deleting inventory failed: " + error);
        throw error; // Consider throwing the error to be handled at a higher level
    }
}

module.exports = {
    getClassifications,
    getInventoryByClassificationId,
    getInventoryByInvId,
    addClassification,
    checkExistingName,
    addInventory,
    updateInventory,
    deleteInventory
};
