import React from "react";
import ReactIcon from "../../ReactIcon";
import { AiOutlineEdit } from "react-icons/ai";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { Draggable, Droppable } from "react-beautiful-dnd";

import "./styles.scss";

function List(props) {
  const { listItems, removeTask, onEditClick, status } = props;

  return (
    <Droppable droppableId={status}>
      {(provided) => (
        <ul
          className="list"
          ref={provided.innerRef}
          {...provided.droppableProps}
        >
          {listItems?.map((task, index) => (
            <Draggable key={task.id} draggableId={task.id} index={index}>
              {(provided) => (
                <li
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  ref={provided.innerRef}
                  className="list__item"
                >
                  {task.title}
                  <div className="actions-group">
                    <button onClick={() => onEditClick(task)}>
                      <ReactIcon
                        size="lg"
                        color="grey"
                        className="actions-group__icon"
                      >
                        <AiOutlineEdit />
                      </ReactIcon>
                    </button>
                    <button onClick={() => removeTask(task.id, task.status)}>
                      <ReactIcon
                        size="lg"
                        color="grey"
                        className="actions-group__icon"
                      >
                        <AiOutlineCloseCircle />
                      </ReactIcon>
                    </button>
                  </div>
                </li>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </ul>
      )}
    </Droppable>
  );
}

export default List;
