const addMoreColumnBtn = document.getElementById("add-more-cloumns-btn");
const createTableBtn = document.getElementById("create-table-form-btn");
const addTableButton = document.getElementById("add-table-submit-btn");

const insertDataDiv = document.getElementById("insert-data-div");
const tableListDiv = document.getElementById("tableList");
const tableFormDiv = document.getElementById("table-form-div");
const insertDataBtnDiv = document.getElementById("insert-btn-div");

const tableName = document.getElementById("table-name");
const tableForm = document.getElementById("table-form");

createTableBtn.addEventListener("click", function () {
    tableFormDiv.style.display = "block";
    tableForm.style.display = "block";
    insertDataDiv.style.display = "none";
});

addMoreColumnBtn.addEventListener("click", function () {
    const node = document.getElementById("form-div");
    const hiddenNode = document.createElement("div");
    hiddenNode.classList.add("formFields");
    hiddenNode.innerHTML = `
    <div id="hidden-form-div" style="display: inline;" > 
        <input class="column-name" type="text" placeholder="field name" required> 
            <select name="input-datatypes" class="input-datatypes" required>
                <option value="">Select an option </option>
                <option value="STRING"> STRING </option>
                <option value="INTEGER"> INTEGER </option>
                <option value="BOOLEAN"> BOOLEAN </option>
                <option value="JSON"> JSON </option>
                <option value="DOUBLE"> DOUBLE </option>  
            </select> </div> `
    node.appendChild(hiddenNode);
});

tableForm.addEventListener("submit", function (e) {

    e.preventDefault();
    const formFields = document.querySelectorAll(".formFields");
    const formData = [];

    formFields.forEach(field => {
        const columnName = field.querySelector('.column-name').value;
        const dataType = field.querySelector('.input-datatypes').value;
        formData.push({ columnName, dataType });
    });
    const tableDetails = {
        tableName: tableName.value,
        columnDetails: formData
    }
    tableForm.style.display = "none";
    addTable(tableDetails);
});

async function addTable(tableDetails) {
    try {
        const response = await axios.post('http://localhost:3000/tableDetails/add-table', {

            tableName: tableDetails.tableName,
            columnDetails: tableDetails.columnDetails
        })

        if (response.status === 201) {
            const tableName = response.data.tableName;
            onetable(tableName);
            console.log("Table added:", tableName);
        }


    }
    catch (error) {
        console.log(error);
    }
}
function onetable(tablename) {
    const li = document.getElementById("tableList");
    const p = document.createElement("p");
    const textNode = document.createTextNode(tablename);
    p.appendChild(textNode);
    li.appendChild(p);
}
window.addEventListener('DOMContentLoaded', tableList);

async function tableList() {
    const li = document.getElementById("tableList");
    try {
        const response = await axios.get("http://localhost:3000/tableDetails/getAllTables");

        if (response.data.tableNames.length > 0) {
            response.data.tableNames.forEach((tableName) => {
                const p = document.createElement("p");
                const textNode = document.createTextNode(tableName);
                p.appendChild(textNode);
                li.appendChild(p);
            });
        }
    } catch (error) {
        console.log(error);
    }
}

let currentTableName = null;
tableListDiv.addEventListener("click", async function (event) {
    tableFormDiv.style.display = "none";
    insertDataDiv.style.display = "block";
    if (event.target.tagName === 'P') {
        const clickedTableName = event.target.textContent;
        if (currentTableName !== clickedTableName) {
            currentTableName = clickedTableName;
            insertDataDiv.style.display = "block";
            clearInsertButton();
            clearDisplayedTable();
            clearDynamicForm();
            viewData(clickedTableName);
        }
    }
});

function clearDisplayedTable() {
    const displayTableData = document.getElementById('display-table-data');
    displayTableData.innerHTML = '';
}

function clearInsertButton() {
    const displayInsertBtn = document.getElementById("insert-btn-div");
    displayInsertBtn.innerHTML = '';
}
function clearDynamicForm() {
    const dynamicForm = document.getElementById("dynamic-form");
    dynamicForm.innerHTML = '';
}

async function viewData(tableName) {
    const insertDataBtn = document.createElement("button");
    insertDataBtn.textContent = "Insert record";
    insertDataBtnDiv.appendChild(insertDataBtn);
    insertDataBtnDiv.style.display = "block";
    insertDataBtn.addEventListener("click", function () {
        dynamicInputFieldForm(tableName);
    });
    try {
        const response = await axios.get(`http://localhost:3000/tableDetails/getTable/${tableName}`);
        if (response.status===200) {
            console.log("Table Data:", tableData);
            clearDisplayedTable();
            if (response.data.tableData.length > 0) {
                displayTable(response.data.tableData, tableName);
            }
        } else {
            throw new Error('Failed to fetch data');
        }
    } catch (error) {
        console.error(error);
    }
}

function displayTable(tableData, tableName) {
    const tableElement = document.createElement("table");
    const headers = Object.keys(tableData[0]);
    const headerRow = document.createElement('tr');
    headers.forEach((header) => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    tableElement.appendChild(headerRow);
    tableData.forEach((row) => {
        const tr = document.createElement("tr");
        headers.forEach((header) => {
            const td = document.createElement('td');
            td.textContent = row[header];
            tr.appendChild(td);
        });
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.id = row.id;
        deleteBtn.addEventListener("click", function () {
            console.log(`Delete row with ID: ${deleteBtn.id}`);
            deleteDataRow(tableName, deleteBtn.id);
        });
        const tdWithButton = document.createElement('td');
        tdWithButton.appendChild(deleteBtn);
        tr.appendChild(tdWithButton);
        tableElement.appendChild(tr);
    });
    const displayTableData = document.getElementById('display-table-data');
    displayTableData.innerHTML = ''; 
    displayTableData.appendChild(tableElement);
}


async function deleteDataRow(tableName, rowID) {
    try {
        const response = await axios.delete(`http://localhost:3000/tableDetails/deleteRow/${tableName}/${rowID}`)

        viewData(tableName)
    } catch (err) {
        console.log(err);
    }
}

async function dynamicInputFieldForm(tableName) {
    const insertDataDiv = document.getElementById("insert-data-div");
    insertDataDiv.innerHTML = '';

    try {
        const response = await axios.get(`http://localhost:3000/tableDetails/getColumns/${tableName}`);
        if (response.status === 200) {
            const tableColumns = response.data.tableDetails;
            console.log("Inside Dynamic Field Form ", tableColumns);
            const form = document.createElement("form");
            form.addEventListener("submit", async function (e) {
                e.preventDefault();
                const formData = new FormData(form);
                const data = {};
                for (let [key, value] of formData.entries()) {
                    data[key] = value;
                }
                console.log(data);
                try {
                    const insertResponse = await axios.post(`http://localhost:3000/tableDetails/insertData/${tableName}`, data)
                     console.log(insertResponse.data);
                     viewData(tableName);
                     insertDataDiv.style.display = 'block'; 

                } catch (error) {
                    console.error(error);
                }
            });

            for (const column in tableColumns) {
                if ((column != 'id') && (column != 'createdAt') && (column != 'updatedAt')) {
                    const label = document.createElement('label');
                    const columnName = column;
                    label.textContent = `${columnName} `;
                    const input = document.createElement('input');
                    input.setAttribute('type', 'text');
                    input.setAttribute('name', column);
                    input.setAttribute('required', 'true');
                    label.appendChild(input);
                    form.appendChild(label);
                }
            }
            const submitButton = document.createElement('button');
            submitButton.setAttribute('type', 'submit');
            submitButton.textContent = 'Insert Data';
            form.appendChild(submitButton);
            insertDataDiv.appendChild(form);
            insertDataDiv.style.display = 'block';
        } else {
            throw new Error('Failed to fetch columns');
        }
    } catch (error) {
        console.error(error);
    }
}