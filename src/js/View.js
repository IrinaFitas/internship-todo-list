import Controller from "./Controller.js";
import EventEmitter from "./EventEmitter.js";
export default class View extends EventEmitter {
    constructor() {
        super();
        this.$list = document.querySelector(".list");
        this.$input = document.querySelector(".input");
        this.$addBtn = document.querySelector(".add-btn");
        this.$activeCounter = document.querySelector(".counter");
        this.$btnShowAll = document.querySelector(".btn-show-all");
        this.$btnShowActive = document.querySelector(".btn-show-active");
        this.$btnShowCompleted = document.querySelector(".btn-show-completed");
        this.render();
        this.addEvents();
    }
    
    get inputValue() {
        return this.$input.value;
    }
    
    get isEmptyValue() {
        return this.inputValueLength === 0 || !this.inputValue.trim();
     }

    set inputValue(value) {
        this.$input.value = value;
    }

    setActiveButton(currentButton) {
        document
            .querySelector(".container-footer")
            .querySelectorAll("button")
            .forEach((button) => {
                button.classList.remove("btn-active");
            });

        currentButton.classList.add("btn-active");
    }

    createBtn(text, classBtn) {
        const btn = document.createElement("button");
        btn.innerHTML = text;
        btn.classList.add(classBtn);

        return btn;
    }

    createInput(classInput, text) {
        let input = document.createElement("input");
        input.type = "text";
        input.classList.add(classInput);
        input.value = text;

        return input;
    }

    hideElements(el, hide) {
        el.forEach( item => {
            item.hidden = hide;
        });
    }

    createElements({text, id, isDone}) {
        const li = document.createElement("li");
        li.id = id;

        if (isDone) {
            li.classList.add("is-done");
        }

        const deleteButton = this.createBtn("&#10006", "delete-btn");
        const doneButton = this.createBtn("&#10004;", "done-btn");
        const editButton = this.createBtn("&#9998;", "edit-btn");
        const span = document.createElement("span");
        span.textContent = text;

        li.appendChild(span);
        li.appendChild(editButton);
        li.appendChild(doneButton);
        li.appendChild(deleteButton);
        this.$list.appendChild(li);
    }

    render(data) {
        this.on("renderList", (data) => {
            data.map( elem => {
                this.createElements(elem);                
            });

            this.showActiveCounter();
        });
    }
    
    renderItem({text, id, isDone}) {
        this.createElements({text, id, isDone});
        this.showActiveCounter();
    }

    sendInput({text, id}) {
        this.emit("itemWasAdded", {text, id});
        this.inputValue = "";
    }

    showActiveCounter() {
        const count = document
            .querySelectorAll(".list > li:not(.is-done)")
            .length;

        this.$activeCounter.textContent = `${count} left`;
    }

    edit({ target }) {
        if (!target.classList.contains("edit-btn")) {
            return;
        }   
        let parent = target.parentElement;
        let [span] = parent.children;
        let buttons = parent.querySelectorAll("button");
        let input = this.createInput("edit-input", span.textContent);

        parent.insertBefore(input, target);
        span.hidden = true;
        this.hideElements(buttons, true);

        input.addEventListener("keypress", ({ key: inputKey, target: inputTarget }) => {
                
            if (inputKey !== "Enter") {
                return;
            }
            const data = {
                id: parent.id,
                newValue: inputTarget.value
            }

            this.emit("itemIsEdited", data); 
            span.hidden = false;
            span.textContent = data.newValue;
            this.hideElements(buttons, false); 
            inputTarget.remove();
        });
    }

    done({ target }) {
        if (!target.classList.contains("done-btn")) {
            return;
        }
        this.emit("itemIsDone", target.parentElement.id);
        target.parentElement.classList.toggle("is-done");
        this.showActiveCounter();
    }

    delete({ target }) {
        if (!target.classList.contains("delete-btn")) {
            return;
        }
        this.emit("itemIsDelete", target.parentElement.id);
        target.parentElement.remove();
        this.showActiveCounter();
    }

    addEvents() {
        this.$input.addEventListener("keypress", ({ key }) => {

            if (this.isEmptyValue) {
                return;
            }

            if (key === "Enter") {
                const data = {
                    text: this.$input.value,
                    id: Date.now()
                };

                this.renderItem(data);
                this.sendInput(data);
            }
        });
        this.$addBtn.addEventListener("click", () => {

            if (this.isEmptyValue) {
                return;
            }

            const data = {
                text: this.$input.value,
                id: Date.now()
            };

            this.renderItem(data);
            this.sendInput(data);
        });

        this.$list.addEventListener("click", this.done.bind(this));
        this.$list.removeEventListener("click", this.done.bind(this));

        this.$list.addEventListener("click", this.delete.bind(this));
        this.$list.removeEventListener("click", this.delete.bind(this));

        this.$list.addEventListener("click", this.edit.bind(this));
        this.$list.removeEventListener("click", this.edit.bind(this));

        this.$btnShowActive.addEventListener("click", ({ target }) => {
            
            this.$list.classList.add("show-active");
            this.$list.classList.remove("show-completed");
            this.setActiveButton(target);
        });

        this.$btnShowCompleted.addEventListener("click", ({ target }) => {
            
            this.$list.classList.add("show-completed");
            this.$list.classList.remove("show-active");
            this.setActiveButton(target);
        });

        this.$btnShowAll.addEventListener("click", ({ target }) => {
           
            this.$list.classList.remove("show-completed");
            this.$list.classList.remove("show-active");
            this.setActiveButton(target);
        });
    }    
}