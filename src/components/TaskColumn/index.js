import React, { useState } from "react";
import List from "./List";
import ReactIcon from "../ReactIcon";
import { CgAddR } from "react-icons/cg";
import "./styles.scss";

function TaskColumn(props) {
  const { status, taskList, addTask, removeTask, onEditClick } = props;

  const [inputValue, setInputValue] = useState("");

  const onChange = (event) => {
    setInputValue(event.target.value);
  };

  const onAdd = () => {
    if (inputValue.trim() === "") return;
    addTask(inputValue, status);
    setInputValue("");
  };

  return (
    <div className="task-list">
      <div className="title task-list__title">{status}</div>
      <div className="task-list__content">
        <List
          status={status}
          listItems={taskList}
          removeTask={removeTask}
          onEditClick={onEditClick}
        />
        <div className="input-wrapper">
          <input
            type="text"
            value={inputValue}
            onChange={onChange}
            onKeyDown={(e) => {
              if (e.keyCode === 13) {
                onAdd();
              }
            }}
          />
          <button onClick={onAdd}>
            <ReactIcon size="xl" color="grey" className="add-icon">
              <CgAddR />
            </ReactIcon>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskColumn;
