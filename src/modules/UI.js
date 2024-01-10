import {
    mainList,
    List,
    addToDo,
    editToDo,
    delToDo,
    sanitize,
    replaceDate,
} from './main';

import isPast from 'date-fns/isPast';

import '../assets/style.css';

import {
    closeIcon,
    pencilIcon,
    plusIcon,
    trashIcon,
} from '../assets/SVG';

const body = document.querySelector('body');

body.innerHTML = `
<header><h1>tremollo</h1></header>
<main>
    <div id="main-list">
    </div>
    <form id="form-new-list">
    <input id="input-new-list" type="text" required>
    <button id="btn-new-list">+ New List</button>
    </form>
</main>
<footer>by&nbsp;<a href="https://www.janebui.com" target="_blank">Jane Bui</a>&nbsp;|&nbsp;<a href="https://github.com/janebui/tremollo" target="_blank">Github Repo</a></footer>
`;

const mainDiv = document.querySelector('#main-list');

// modal stuff
const modal = document.createElement('div');
modal.setAttribute('class', 'modal');
modal.innerHTML = `
<div class="modal-box">
    <div class="modal-header"><h2 class="modal-title"></h2>${closeIcon}</div>
    <div class="modal-content">
</div>
`;

document.body.appendChild(modal);
const modalContent = document.querySelector('.modal-content');
const closeBtn = document.getElementsByClassName("close")[0];

closeBtn.addEventListener('click', () => {
    modal.style.display = "none";
});

window.addEventListener('mousedown', (e) => {
    if (e.target == modal) {
        modal.style.display = "none";
    }
})


// display the main list of lists
function displayMainList() {

    mainDiv.innerHTML = `
    ${mainList.arr.map((item, i) => `<div class="list" data-list="${i}">` +
        displayList(item, i) + `</div>`
        ).join('')}
        `;
    addEventListeners();
};


// display an individual todo list
function displayList(list) {
    return `
    <div class="list-header">
        <div class="show-header">
            <h3>${list.name}</h3>
            <div class="edit-btns">
            <button class="pencil-btn">${pencilIcon}</button>
            <button class="del-list-btn">${trashIcon}</button>
            </div>
        </div>
        <form class="edit-list-header">
        <input class="edit-name-input" type="text" value="${list.name}" autofocus onfocus="var temp_value=this.value; this.value=''; this.value=temp_value" />
        <button class="edit-list-save">Save</button>
        </form>
    </div>

    <ul>` +
        list.todoList.map((item, i) =>
            `<li class="item" data-item="${i}">
            ${item.title} <span class="priority ${item.priority}">${item.priority}</span>
            </li>`
        ).join('') +
        `</ul>
    <button class="show-add">
        ${plusIcon}
    </button>
    `;
};


// add Event Listeners to list buttons
function addEventListeners() {
    document.querySelector('#form-new-list').addEventListener('submit', addNewList);

    document.querySelectorAll('.del-list-btn').forEach((del, i) => {
        del.number = i;
        del.addEventListener('click', deleteList);
    });

    document.querySelectorAll('.pencil-btn').forEach((pen, i) => {
        pen.number = i;
        pen.addEventListener('click', editListName);
    });

    document.querySelectorAll('.edit-list-header').forEach((form, i) => {
        form.number = i;
        form.name = form.querySelector('input').value;
        form.addEventListener('submit', submitListName);
    });

    document.querySelectorAll('.show-add').forEach((btn, i) => {
        btn.number = i;
        btn.addEventListener('click', addNewItem);
    });

    document.querySelectorAll('.item').forEach((item) => {
        item.addEventListener('click', editItem);
    });
};


// create a new list using the user's input
function addNewList(e) {
    e.preventDefault();
    e.stopPropagation();

    let newListName = sanitize(document.querySelector('#input-new-list').value);
    mainList.add(List(newListName));

    displayMainList();

    this.reset();
};


// when user clicks on pencil button to edit list name, change to edit mode display
function editListName(e) {
    e.preventDefault();
    e.stopPropagation();

    let editMode = true;

    let pen = e.currentTarget;
    let showHeader = pen.parentNode.parentNode;
    let editListHeader = showHeader.parentNode.lastElementChild;
    let editNameInput = editListHeader.querySelector('input');

    if (editMode) {
        showHeader.style.display = 'none';
        editListHeader.style.display = 'flex';
        editNameInput.focus();
    }

    // remove focus from input when the user clicks outside the input
    window.addEventListener('mousedown', removeFocus);

    function removeFocus(e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.target != editNameInput) {
            editMode = false;
            showHeader.style.display = 'flex';
            editListHeader.style.display = 'none';
            window.removeEventListener('mousedown', removeFocus)
        }
    };
};


// when user changes a list's name, update main array and update display
function submitListName(e) {
    e.preventDefault();
    e.stopPropagation();

    let oldName = e.target.name;
    let newName = e.target.querySelector('input').value;

    if (newName != oldName) {
        mainList.editName(e.target.number, newName);
        displayMainList();
    } else {
        return;
    };
};


// delete a list
function deleteList(e) {
    e.preventDefault();
    e.stopPropagation();

    let delTarget = e.currentTarget.number;

    mainList.del(delTarget);
    displayMainList();
};


// create a new item inside a list
function addNewItem(e) {
    e.preventDefault();
    e.stopPropagation();

    const l = e.currentTarget.number;

    displayForm('', '', '', '', "Add a New Item");
    const form = document.querySelector('#item-form');

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // grab the form values and return a new to-do item
        let newToDo = processForm(form);

        addToDo(l, newToDo);

        modal.style.display = 'none';
        displayMainList();
    });
};


// when user clicks on an item or the edit item button, display modal
function editItem(e) {
    e.stopPropagation();

    let l = e.currentTarget.parentNode.parentNode.dataset.list;
    let i = e.currentTarget.dataset.item;
    let item = mainList.arr[l].todoList[i];

    // display the edit form with the values pre-filled
    displayForm(item.title, item.description, item.dueDate, item.priority, "Edit Item");

    // when user edits the item, update the display and main list
    const form = document.querySelector('#item-form');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        e.stopPropagation();

        // grab the form values and return the edited todo item
        let newToDo = processForm(form);

        editToDo(l, i, newToDo);

        modal.style.display = 'none';
        displayMainList();
    });

    // create a delete button
    const modalButtons = document.querySelector('.modal-buttons')
    const delBtn = document.createElement('button');
    delBtn.setAttribute('id', 'delete');
    delBtn.innerHTML = trashIcon;
    modalButtons.appendChild(delBtn);
    delBtn.addEventListener('click', deleteItem, false);
    delBtn.item = [l, i]; // add prototype so location of item can be accessed by deleteItem
};

// when user clicks delete button, delete from display and mainList
function deleteItem(e) {
    e.stopPropagation();
    let l = e.currentTarget.item[0];
    let i = e.currentTarget.item[1];

    delToDo(l, i);

    modal.style.display = 'none';
    displayMainList();
};


// display the modal with the form inside
function displayForm(title, description, dueDate, priority, header) {
    modal.style.display = 'block';

    document.querySelector('.modal-title').innerHTML = header;

    modalContent.innerHTML = `
    <form id="item-form">
        <label for="title">Title:</label>
        <input name="title" type="text" value="${title}" required />

        <label for="description">Description:</label>
        <textarea name="description" type="text">${description}</textarea>

        <label for="duedate-input" id="duedate-label">Due Date:</label>
        <input id="duedate-input" name="duedate" type="date" value="${dueDate}" />

        <div id="radio-btns">
        Priority:
        <label class="rb-priority"><input name="priority" type="radio" value="low" 
        ${priority == 'low' ? 'checked':''} />Low</label>

        <label class="rb-priority"><input name="priority" type="radio" value="high" 
        ${priority == 'high' ? 'checked':''} />High</label>
        </div>
    </form>
    <div class="modal-buttons">
        <button id="confirm-btn" form="item-form">Confirm</button>
    </div>
    `;

    if (dueDate) {
        let dateObj = new Date(replaceDate(dueDate));
        if (isPast(dateObj)) {
            const duedate = document.querySelector('#duedate-label');
            duedate.textContent = "OVERDUE";
            duedate.classList.add('overdue');
        }
    };
};

// grab the user inputs from the form
function processForm(form) {
    let priority = '';
    form.querySelectorAll('input[name="priority"]').forEach(function (rb) {
        if (rb.checked) {
            priority = rb.value;
        }
    });

    let date = form.querySelector('input[name="duedate"]').value;

    let newToDo = {
        title: sanitize(form.querySelector('input[name="title"]').value),
        description: sanitize(form.querySelector('textarea[name="description"]').value),
        dueDate: date,
        priority: priority
    };
    return newToDo;
};


displayMainList();