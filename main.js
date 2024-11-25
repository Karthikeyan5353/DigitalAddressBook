// regular expression for validation
const strRegex = /^[a-zA-Z\s]*$/; // containing only letters
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im; // phone format validation

// DOM elements
const fullscreenDiv = document.getElementById('fullscreen-div');
const modal = document.getElementById('modal');
const addBtn = document.getElementById('add-btn');
const closeBtn = document.getElementById('close-btn');
const modalBtns = document.getElementById('modal-btns');
const form = document.getElementById('modal');
const addrBookList = document.querySelector('#addr-book-list tbody');

// Variables for address form data
let firstName = lastName = email = phone = city = labels = "";

// Address class
class Address {
    constructor(id, firstName, lastName, email, phone, city, labels) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.city = city;
        this.labels = labels;
    }

    static getAddresses() {
        // Retrieve from local storage
        let addresses;
        if (localStorage.getItem('addresses') == null) {
            addresses = [];
        } else {
            addresses = JSON.parse(localStorage.getItem('addresses'));
        }
        return addresses;
    }

    static addAddress(address) {
        const addresses = Address.getAddresses();
        addresses.push(address);
        localStorage.setItem('addresses', JSON.stringify(addresses));
    }

    static deleteAddress(id) {
        const addresses = Address.getAddresses();
        addresses.forEach((address, index) => {
            if (address.id == id) {
                addresses.splice(index, 1);
            }
        });
        localStorage.setItem('addresses', JSON.stringify(addresses));
        form.reset();
        UI.closeModal();
        addrBookList.innerHTML = "";
        UI.showAddressList();
    }

    static updateAddress(item) {
        const addresses = Address.getAddresses();
        addresses.forEach(address => {
            if (address.id == item.id) {
                address.firstName = item.firstName;
                address.lastName = item.lastName;
                address.email = item.email;
                address.phone = item.phone;
                address.city = item.city;
                address.labels = item.labels;
            }
        });
        localStorage.setItem('addresses', JSON.stringify(addresses));
        addrBookList.innerHTML = "";
        UI.showAddressList();
    }
}

// UI class
class UI {
    static showAddressList() {
        const addresses = Address.getAddresses();
        addresses.forEach(address => UI.addToAddressList(address));
    }

    static addToAddressList(address) {
        const tableRow = document.createElement('tr');
        tableRow.setAttribute('data-id', address.id);
        tableRow.innerHTML = `
            <td>${address.id}</td>
            <td>
                <span class="address">${address.city}</span>
            </td>
            <td><span>${address.labels}</span></td>
            <td>${address.firstName + " " + address.lastName}</td>
            <td>${address.phone}</td>
        `;
        addrBookList.appendChild(tableRow);
    }

    static showModalData(id) {
        const addresses = Address.getAddresses();
        addresses.forEach(address => {
            if (address.id == id) {
                form.first_name.value = address.firstName;
                form.last_name.value = address.lastName;
                form.email.value = address.email;
                form.phone.value = address.phone;
                form.city.value = address.city;
                form.labels.value = address.labels;
                document.getElementById('modal-title').innerHTML = "Change Address Details";

                document.getElementById('modal-btns').innerHTML = `
                    <button type="submit" id="update-btn" data-id="${id}">Update</button>
                    <button type="button" id="delete-btn" data-id="${id}">Delete</button>
                `;
            }
        });
    }

    static showModal() {
        modal.style.display = "block";
        fullscreenDiv.style.display = "block";
    }

    static closeModal() {
        modal.style.display = "none";
        fullscreenDiv.style.display = "none";
    }
}

// DOM Content Loaded
window.addEventListener('DOMContentLoaded', () => {
    eventListeners();
    UI.showAddressList();
});

// Event listeners
function eventListeners() {
    // Show add item modal
    addBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('modal-title').innerHTML = "Add Address";
        UI.showModal();
        document.getElementById('modal-btns').innerHTML = `
            <button type="submit" id="save-btn">Save</button>
        `;
    });

    // Close add item modal
    closeBtn.addEventListener('click', UI.closeModal);

    // Add an address item
    modalBtns.addEventListener('click', (event) => {
        event.preventDefault();
        if (event.target.id == "save-btn") {
            let isFormValid = getFormData();
            if (!isFormValid) {
                form.querySelectorAll('input').forEach(input => {
                    setTimeout(() => {
                        input.classList.remove('errorMsg');
                    }, 1500);
                });
            } else {
                let allItem = Address.getAddresses();
                let lastItemId = (allItem.length > 0) ? allItem[allItem.length - 1].id : 0;
                lastItemId++;

                const addressItem = new Address(lastItemId, firstName, lastName, email, phone, city, labels);
                Address.addAddress(addressItem);
                UI.closeModal();
                UI.addToAddressList(addressItem);
                form.reset();
            }
        }
    });

    // Table row items
    addrBookList.addEventListener('click', (event) => {
        UI.showModal();
        let trElement;
        if (event.target.parentElement.tagName == "TD") {
            trElement = event.target.parentElement.parentElement;
        }

        if (event.target.parentElement.tagName == "TR") {
            trElement = event.target.parentElement;
        }

        let viewID = trElement.dataset.id;
        UI.showModalData(viewID);
    });

    // Delete an address item
    modalBtns.addEventListener('click', (event) => {
        if (event.target.id == 'delete-btn') {
            Address.deleteAddress(event.target.dataset.id);
        }
    });

    // Update an address item
    modalBtns.addEventListener('click', (event) => {
        event.preventDefault();
        if (event.target.id == "update-btn") {
            let id = event.target.dataset.id;
            let isFormValid = getFormData();
            if (!isFormValid) {
                form.querySelectorAll('input').forEach(input => {
                    setTimeout(() => {
                        input.classList.remove('errorMsg');
                    }, 1500);
                });
            } else {
                const addressItem = new Address(id, firstName, lastName, email, phone, city, labels);
                Address.updateAddress(addressItem);
                UI.closeModal();
                form.reset();
            }
        }
    });
}

// Get form data
function getFormData() {
    let inputValidStatus = [];

    if (!strRegex.test(form.first_name.value) || form.first_name.value.trim().length == 0) {
        addErrMsg(form.first_name);
        inputValidStatus[0] = false;
    } else {
        firstName = form.first_name.value;
        inputValidStatus[0] = true;
    }

    if (!strRegex.test(form.last_name.value) || form.last_name.value.trim().length == 0) {
        addErrMsg(form.last_name);
        inputValidStatus[1] = false;
    } else {
        lastName = form.last_name.value;
        inputValidStatus[1] = true;
    }

    if (!emailRegex.test(form.email.value)) {
        addErrMsg(form.email);
        inputValidStatus[2] = false;
    } else {
        email = form.email.value;
        inputValidStatus[2] = true;
    }

    if (!phoneRegex.test(form.phone.value)) {
        addErrMsg(form.phone);
        inputValidStatus[3] = false;
    } else {
        phone = form.phone.value;
        inputValidStatus[3] = true;
    }

    if (!strRegex.test(form.city.value) || form.city.value.trim().length == 0) {
        addErrMsg(form.city);
        inputValidStatus[4] = false;
    } else {
        city = form.city.value;
        inputValidStatus[4] = true;
    }
    
    labels = form.labels.value;
    return inputValidStatus.includes(false) ? false : true;
}

function addErrMsg(inputBox) {
    inputBox.classList.add('errorMsg');
}
//name filter
function filterAddresses() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();
    const rows = addrBookList.querySelectorAll('tr');

    rows.forEach(row => {
        const name = row.cells[3].innerText.toLowerCase(); // Adjust to match "By Name" column index
        if (name.includes(searchTerm)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}
