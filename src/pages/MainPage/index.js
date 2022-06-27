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

  const [pastHistory, setPastHistory] = React.useState([]);
  const [futureHistory, setFutureHistory] = React.useState([]);

  const updateHistory = () => {
    const newStep = { active: taskListActive, completed: taskListCompleted };
    setPastHistory((pastHistory) => [...pastHistory, newStep]);
    setFutureHistory([]);
  };

  const undo = () => {
    if (pastHistory.length > 0) {
      const previousStep = pastHistory[pastHistory.length - 1];
      setTaskListActive(previousStep.active);
      setTaskListCompleted(previousStep.completed);

      setPastHistory((pastHistory) => pastHistory.slice(0, -1));
      setFutureHistory((futureHistory) => [
        ...futureHistory,
        { active: taskListActive, completed: taskListCompleted },
      ]);
    }
  };

  const redo = () => {
    if (futureHistory.length > 0) {
      const futureStep = futureHistory[futureHistory.length - 1];
      setTaskListActive(futureStep.active);
      setTaskListCompleted(futureStep.completed);

      setPastHistory((pastHistory) => [
        ...pastHistory,
        { active: taskListActive, completed: taskListCompleted },
      ]);
      setFutureHistory((futureHistory) => futureHistory.slice(0, -1));
    }
  };

  const detectKeyDown = (e) => {
    if (e.keyCode === 90 && e.ctrlKey) {
      undo();
      e.preventDefault();
    }
    if (e.keyCode === 89 && e.ctrlKey) {
      redo();
      e.preventDefault();
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
    const newTask = createTask(uuidv4(), title, status);

    if (status === taskStatuses.completed) {
      const desiredTaskList = [...taskListCompleted, newTask];
      setTaskListCompleted(desiredTaskList);
    } else {
      const desiredTaskList = [...taskListActive, newTask];
      setTaskListActive(desiredTaskList);
    }

    updateHistory();
  };

  const removeTask = (id, status) => {
    if (status === taskStatuses.completed) {
      const desiredTaskList = taskListCompleted.filter(
        (task) => task.id !== id
      );
      setTaskListCompleted(desiredTaskList);
    } else {
      const desiredTaskList = taskListActive.filter((task) => task.id !== id);
      setTaskListActive(desiredTaskList);
    }

    updateHistory();
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

    updateHistory();
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
    arr.splice(to, 0, item);
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
        const desiredTaskList = [...taskListCompleted];
        reorder(desiredTaskList, source.index, destination.index);
        setTaskListCompleted(desiredTaskList);
      } else {
        const desiredTaskList = [...taskListActive];
        reorder(desiredTaskList, source.index, destination.index);
        setTaskListActive(desiredTaskList);
      }
    } else {
      if (source.droppableId === taskStatuses.completed) {
        const task = taskListCompleted.find((task) => task.id === draggableId);

        const desiredActive = [...taskListActive];
        const desiredCompleted = [...taskListCompleted];

        move(desiredActive, destination.index, {
          ...task,
          status: taskStatuses.active,
        });
        desiredCompleted.splice(source.index, 1);

        setTaskListActive(desiredActive);
        setTaskListCompleted(desiredCompleted);
      } else {
        const task = taskListActive.find((task) => task.id === draggableId);

        const desiredActive = [...taskListActive];
        const desiredCompleted = [...taskListCompleted];

        move(desiredCompleted, destination.index, {
          ...task,
          status: taskStatuses.completed,
        });
        desiredActive.splice(source.index, 1);

        setTaskListActive(desiredActive);
        setTaskListCompleted(desiredCompleted);
      }
    }

    updateHistory();
  };

  return (
    <div className="container">
      <DragDropContext onDragEnd={onDragEnd}>
        <TaskColumn
          taskList={taskListActive}
          status={taskStatuses.active}
          addTask={addTask}
          removeTask={removeTask}
          onEditClick={onEditClick}
        />

        <TaskColumn
          taskList={taskListCompleted}
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
