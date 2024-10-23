const invModel = require("../models/inventory-model");
const accountModel = require("../models/account-model");
const msgModel = require("../models/message-model");
const Util = {};
const jwt = require("jsonwebtoken");
const dayjs = require("dayjs");
require("dotenv").config();

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
  let list = "<ul>";
  list += '<li><a href="/" title="Home page">Home</a></li>';
  data.rows.forEach((row) => {
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
  list += "</ul>";
  return list;
};

/* **************************************
 * Build the classification view HTML
 ************************************ */
Util.buildClassificationGrid = async function (data) {
  let grid = "";
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="/inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors"></a>';
      grid += '<div class="namePrice">';
      grid += "<hr>";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid += "<span>$" + new Intl.NumberFormat("en-US").format(vehicle.inv_price) + "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* **************************************
 * Build the inventory details HTML
 ************************************ */
Util.buildInventoryDetails = async function (data) {
  let content = "";
  if (data) {
    const usPrice = new Intl.NumberFormat("en-US").format(data.inv_price);
    const usMiles = new Intl.NumberFormat("en-US").format(data.inv_miles);
    content = `
      <div class="inventory-detail-card">
        <div class="image-box">
          <img src='${data.inv_image}' alt='photo of ${data.inv_year} ${data.inv_make} ${data.inv_model}'>
        </div>
        <div class="detail-box">
          <h3>${data.inv_make} ${data.inv_model} Details</h3>
          <div class="price"><strong>Price: </strong>$${usPrice}</div>
          <div class="description"><strong>Description: </strong>${data.inv_description}</div>
          <div class="color"><strong>Color: </strong>${data.inv_color}</div>
          <div class="miles"><strong>Miles: </strong>${usMiles}</div>
        </div>
      </div>
    `;
  } else {
    content = "<p>Oops...the details of the vehicle are not available right now. Please try again later.</p>";
  }
  return content;
};

/* **************************************
 * Build the classification list HTML
 ************************************ */
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList = '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (classification_id != null && row.classification_id == classification_id) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other functions in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ***************************************
 * Middleware to check token validity
 *************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, function (err, accountData) {
      if (err) {
        req.flash("Please log in");
        res.clearCookie("jwt");
        return res.redirect("/account/login");
      }
      res.locals.accountData = accountData;
      res.locals.loggedin = 1;
      next();
    });
  } else {
    next();
  }
};

/* ****************************************
 *  Check if user is logged in
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 *  Check if user is Admin or Employee
 * ************************************ */
Util.checkAuthZ = (req, res, next) => {
  const userType = res.locals.accountData.account_type;
  if (userType === "Admin" || userType === "Employee") {
    next();
  } else {
    req.flash("notice", "You don't have permission to access this page.");
    return res.redirect("/account/login");
  }
};

/* ************************
 * Build recipient list
 ************************** */
Util.recipientListSelect = async function (message_from, message_to) {
  let data = await accountModel.getALLAccounts(message_from);
  let recipientList = `
    <select name="message_to" id="message_to" required>
      <option value="">Select a recipient</option>
      ${data
        .map(
          (d) => `
          <option value="${d.account_id}" ${message_to != null && d.account_id == message_to ? "selected" : ""}>
            ${d.account_firstname} ${d.account_lastname}
          </option>`
        )
        .join("")}
    </select>
  `;
  return recipientList;
};

/* ************************
 * Retrieve number of unread messages by account
 ************************** */
Util.getUnreadMsgNum = async function (message_to) {
  const data = await msgModel.getUnreadMsgByMessage_to(message_to);
  return data.length;
};

/* ************************
 * Retrieve message table by account
 ************************** */
Util.getMsgTable = async function (message_to) {
  const data = await msgModel.getMessagesByMessage_to(message_to);
  if (data && data.length > 0) {
    let msgContent = data
      .map((d) => {
        let formattedDate = dayjs(d.message_created).format("DD-MM-YYYY HH:mm");
        let mailIcon = d.message_read
          ? `<i class="fa fa-envelope-o" aria-hidden="true"></i>` 
          : `<i class="fa fa-envelope" aria-hidden="true"></i>`;
        return `
          <tr>
            <td class="ellipsis">${formattedDate}</td>
            <td class="ellipsis">${mailIcon}<a href="/message/read/${d.message_id}">${d.message_subject}</a></td>
            <td>${d.sender_name}</td>
            <td>${d.message_read}</td>
          </tr>`;
      })
      .join("");
    return msgContent;
  } else {
    return "<p>No messages found.</p>";
  }
};

/* **************************************
* Build the link HTML in edit-account
* ************************************ */
Util.buildAccountLink = async function(data) {
  let content;

  if (data) {
    content = `
      <div id="edit-account">
        <a href="/account/edit-account/${data.account_id}">
          Edit Account Information
        </a>
      </div>
    `;
  } else {
    throw new Error("Account data is invalid.");
  }

  return content;
};

/* ************************
 * Retrieve archived message table by account
 ************************** */
Util.getArchivedMsgTable = async function (message_to) {
  const data = await msgModel.getArchivedMsgByFrom(message_to);
  if (data && data.length > 0) {
    const msgContent = await Promise.all(
      data.map(async (d) => {
        const formattedDate = dayjs(d.message_created).format("DD-MM-YYYY HH:mm");
        const sender_name = await accountModel.getFullNameByAccountId(d.message_from);
        return `
          <tr>
            <td class="ellipsis">${formattedDate}</td>
            <td class="ellipsis"><a href="/message/read/${d.message_id}">${d.message_subject}</a></td>
            <td>${sender_name}</td>
            <td>${d.message_read}</td>
          </tr>`;
      })
    );
    return msgContent.join("");
  } else {
    return "<p>No archived messages found.</p>";
  }
};

module.exports = Util;
