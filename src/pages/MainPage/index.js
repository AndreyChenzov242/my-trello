import React, { useEffect, useState } from "react";
import TaskColumn from "../../components/TaskColumn";
import { taskStatuses } from "../../constants/taskStatuses";
import { v4 as uuidv4 } from "uuid";
import ReactIcon from "../../components/ReactIcon";
import { AiOutlineCloseCircle } from "react-icons/ai";
import Modal from "react-modal";
import { DragDropContext } from "react-beautiful-dnd";
import "./styles.scss";

function createTask(id, title, status) {
  return { id, title, status };
}

function MainPage() {
  const [taskListCompleted, setTaskListCompleted] = useState([]);
  const [taskListActive, setTaskListActive] = useState([]);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [firstLoad, setFirstLoad] = useState(true);

  useEffect(() => {
    if (!firstLoad) {
      setFirstLoad(false);
      return;
    }

    setHistory([
      ...history,
      { active: taskListActive, completed: taskListCompleted },
    ]);

    if (history.length > 0) {
      setHistoryIndex(historyIndex + 1);
    }
  }, [taskListActive, taskListCompleted]);

  useEffect(() => {
    console.log("history", history);
  }, [history]);

  useEffect(() => {
    console.log("historyIndex", historyIndex);
  }, [historyIndex]);

  const undo = () => {
    setHistoryIndex(historyIndex - 1);
  };

  const detectKeyDown = (e) => {
    if (e.keyCode === 90 && e.ctrlKey) {
      console.log("ctrl+z");
      undo();
    }
    if (e.keyCode === 88 && e.ctrlKey) {
      console.log("ctrl+y");
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", detectKeyDown);

    return () => {
      document.removeEventListener("keydown", detectKeyDown);
    };
  }, [detectKeyDown]);

  useEffect(() => {
    if (currentTask) {
      setNewTaskTitle(currentTask.title);
    }
  }, [currentTask]);

  const addTask = (title, status) => {
    if (status === taskStatuses.completed) {
      const newTask = createTask(uuidv4(), title, status);
      setTaskListCompleted([...taskListCompleted, newTask]);
      return;
    }

    const newTask = createTask(uuidv4(), title, status);
    setTaskListActive([...taskListActive, newTask]);
  };

  const removeTask = (id, status) => {
    if (status === taskStatuses.completed) {
      const desiredTaskList = taskListCompleted.filter(
        (task) => task.id !== id
      );
      setTaskListCompleted(desiredTaskList);
      return;
    }

    const desiredTaskList = taskListActive.filter((task) => task.id !== id);
    setTaskListActive(desiredTaskList);
  };

  const editTask = (id, status, newTask) => {
    if (newTask === currentTask.title) return;
    if (newTask.trim() === "") return;

    if (status === taskStatuses.completed) {
      const desiredTaskList = taskListCompleted.map((task) =>
        task.id === id ? { ...task, title: newTask } : task
      );
      setTaskListCompleted(desiredTaskList);
    } else {
      const desiredTaskList = taskListActive.map((task) =>
        task.id === id ? { ...task, title: newTask } : task
      );
      setTaskListActive(desiredTaskList);
    }

    closeModal();
  };

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function onEditClick(task) {
    openModal();
    setCurrentTask(task);
  }

  const reorder = (arr, from, to) => {
    arr.splice(to, 0, arr.splice(from, 1)[0]);
  };

  const move = (arr, to, item) => {
    return arr.splice(to, 0, item);
  };

  const onChange = (event) => {
    setNewTaskTitle(event.target.value);
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }
    if (source.droppableId === destination.droppableId) {
      if (source.index === destination.index) {
        return;
      }

      if (source.droppableId === taskStatuses.completed) {
        reorder(taskListCompleted, source.index, destination.index);
        setTaskListCompleted([...taskListCompleted]);
        return;
      }

      reorder(taskListActive, source.index, destination.index);
      setTaskListActive([...taskListActive]);
    } else {
      if (source.droppableId === taskStatuses.completed) {
        const task = taskListCompleted.find((task) => task.id === draggableId);

        move(taskListActive, destination.index, {
          ...task,
          status: taskStatuses.active,
        });
        taskListCompleted.splice(source.index, 1);

        setTaskListActive([...taskListActive]);
        setTaskListCompleted([...taskListCompleted]);
      } else {
        const task = taskListActive.find((task) => task.id === draggableId);

        move(taskListCompleted, destination.index, {
          ...task,
          status: taskStatuses.completed,
        });
        taskListActive.splice(source.index, 1);

        setTaskListActive([...taskListActive]);
        setTaskListCompleted([...taskListCompleted]);
      }
    }
  };

  return (
    <div className="container">
      <DragDropContext onDragEnd={onDragEnd}>
        <TaskColumn
          taskList={history[historyIndex]?.active}
          status={taskStatuses.active}
          addTask={addTask}
          removeTask={removeTask}
          onEditClick={onEditClick}
        />

        <TaskColumn
          taskList={history[historyIndex]?.completed}
          status={taskStatuses.completed}
          addTask={addTask}
          removeTask={removeTask}
          onEditClick={onEditClick}
        />
      </DragDropContext>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className="modal"
        overlayClassName="overlay"
        contentLabel="Example Modal"
        ariaHideApp={false}
      >
        <button className="button-close" onClick={closeModal}>
          <ReactIcon size="lg" color="grey" className="actions-group__icon">
            <AiOutlineCloseCircle />
          </ReactIcon>
        </button>
        <div>Edit task</div>
        <div className="input-wrapper">
          <input type={"text"} value={newTaskTitle} onChange={onChange} />
          <button
            className="button-save"
            onClick={() =>
              editTask(currentTask.id, currentTask.status, newTaskTitle)
            }
          >
            save
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default MainPage;
