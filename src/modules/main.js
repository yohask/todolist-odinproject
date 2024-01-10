// save the working Main List array to local storage as a string
function saveLS(arr) {
    localStorage.setItem('items', JSON.stringify(arr));
};

// module of the main list of lists
export const mainList = (() => {
    // grab data from local storage. if there is none, then initialize w/ sample data
    let arr = JSON.parse(localStorage.getItem('items')) || 
        [ 
            {
                name: 'Monday',
                todoList: [
                    {
                        title: 'Feed the Frog',
                        description: 'Frog Ribbit',
                        dueDate: '2024-1-09',
                        priority: 'high'
                    },
                    {
                        title: 'Go to Work',
                        description: 'Look Alive',
                        dueDate: '2024-1-24',
                        priority: ''
                    }
                ]
            }
        ];

    function add(list) {
        arr.push(list);
        saveLS(arr);
    };

    function editName(i, newName) {
        arr[i].name = newName;
        saveLS(arr);
    };

    function del(i) {
        arr.splice(i, 1);
        saveLS(arr);
    };

    return {
        arr,
        editName,
        add,
        del
    };
})();

// factory function for list
export const List = (name) => {
    const todoList = [];
    return {
        name,
        todoList
    };
};

// factory function for to-do items. At a minimum they should have a title, description, dueDate and priority. You might also want to include notes or even a checklist.
export const ToDo = (title, description, dueDate, priority) => {
    return {
        title,
        description,
        dueDate,
        priority
    };
};

// add a new to-do item to the list
export function addToDo(l, todo) {
    mainList.arr[l].todoList.push(todo);
    saveLS(mainList.arr);
};

// edit an existing item i from list l
export function editToDo(l, i, newObj) {
    Object.assign(mainList.arr[l].todoList[i], newObj);
    saveLS(mainList.arr);
};

// delete todo item i from list l
export function delToDo(l, i) {
    mainList.arr[l].todoList.splice(i, 1);
    saveLS(mainList.arr);
};

// change the hyphens to slashes in the input date
export function replaceDate(date) {
    return date.replace(/-/g, '/');;
};

// sanitize user input
export function sanitize(string) {
    return string.replace(/[.*+?^${}()|<>[\]\\]/g, '');
};

// localStorage.clear();
