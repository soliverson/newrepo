const Classification = require("../models/classification-model");
const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
    try {
        // Fetch classifications from the database
        const data = await Classification.findAllClassifications();

        // Initialize the navigation list
        let list = "<ul>";
        list += '<li><a href="/" title="Home page">Home</a></li>';

        // Check if data is an array before iterating
        if (Array.isArray(data)) {
            data.forEach((row) => {
                list += "<li>";
                list += 
                    '<a href="/inv/type/' + 
                    row.classification_id + 
                    '" title="See our inventory of ' + 
                    row.classification_name + 
                    ' vehicles">' + 
                    row.classification_name + 
                    "</a>";
                list += "</li>";
            });
        } else {
            console.error("Error: Expected data to be an array but got", data);
        }

        list += "</ul>";
        return list;
    } catch (error) {
        console.error("Error fetching navigation: ", error);
        return "<ul><li>Error loading navigation</li></ul>"; // Fallback in case of error
    }
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* **************************************
 * Build the classification view HTML
 * ************************************ */
Util.buildClassificationGrid = async function (data) {
    let grid;
    if (data.length > 0) {
        grid = '<ul id="inv-display">';
        data.forEach(vehicle => {
            grid += '<li>';
            grid += '<a href="../../inv/detail/' + vehicle.inv_id
                + '" title="View ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + ' details"><img src="' + vehicle.inv_thumbnail
                + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model
                + ' on CSE Motors" /></a>';
            grid += '<div class="namePrice">';
            grid += '<hr />';
            grid += '<h2>';
            grid += '<a href="../../inv/detail/' + vehicle.inv_id + '" title="View '
                + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">'
                + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>';
            grid += '</h2>';
            grid += '<span>$'
                + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>';
            grid += '</div>';
            grid += '</li>';
        });
        grid += '</ul>';
    } else {
        grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
    }
    return grid;
};

/* **************************************
 * Build the classification list (dropdown)
 * ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
    let data = await invModel.getClassifications();
    let classificationList =
        '<select name="classification_id" id="classificationList" required>';
    classificationList += "<option value=''>Choose a Classification</option>";
    data.rows.forEach((row) => {
        classificationList += '<option value="' + row.classification_id + '"';
        if (
            classification_id != null &&
            row.classification_id == classification_id
        ) {
            classificationList += " selected ";
        }
        classificationList += ">" + row.classification_name + "</option>";
    });
    classificationList += "</select>";
    return classificationList;
};

/* **************************************
 * Build the vehicle detail view HTML
 * ************************************ */
Util.buildVehicleDetailView = async function (vehicle) {
    let detailView = '';

    if (vehicle) {
        detailView += '<div class="vehicle-detail-container">'; // Updated class name

        // Vehicle title
        detailView += '<div class="vehicle-info">';
        detailView += '<h1>' + vehicle.inv_make + ' ' + vehicle.inv_model + '</h1>';

        // Vehicle price
        detailView += '<div class="vehicle-price">';
        detailView += '<p><strong>Price: </strong>$' + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</p>';
        detailView += '</div>';

        // Vehicle description
        detailView += '<div class="vehicle-description">';
        detailView += '<p><strong>Description: </strong>' + vehicle.inv_description + '</p>';
        detailView += '</div>';

        // Vehicle details (Year, Miles, Color)
        detailView += '<div class="vehicle-details">';
        detailView += '<p><strong>Year: </strong>' + vehicle.inv_year + '</p>';
        detailView += '<p><strong>Miles: </strong>' + new Intl.NumberFormat('en-US').format(vehicle.inv_miles) + ' miles</p>';
        detailView += '<p><strong>Color: </strong>' + vehicle.inv_color + '</p>';
        detailView += '</div>';
        detailView += '<a href="/inv/trigger-error" class="back-link">Error Link</a>';
        detailView += '</div>'; // Close vehicle-info div

        // Vehicle image
        detailView += '<div class="vehicle-image">';
        detailView += '<img src="' + vehicle.inv_image + '" alt="Image of ' + vehicle.inv_make + ' ' + vehicle.inv_model + ' on CSE Motors" />';
        detailView += '</div>'; // Close vehicle-image div

        detailView += '</div>'; // Close vehicle-detail-container
    } else {
        detailView = '<p class="notice">Sorry, vehicle details could not be found.</p>';
    }

    return detailView;
};

module.exports = Util;
