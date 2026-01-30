import { useEffect, useState } from "react";
import "./App.css";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";


const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); 
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const initialTasks = [
  {
    id: 1,
    title: "Complete project report",
    description: "Finish the Q4 sales report with charts",
    priority: "high",
    status: "pending",
    dueDate: "2026-02-15",
    createdAt: "2025-01-29"
  },
  {
    id: 2,
    title: "Buy groceries",
    description: "Milk, bread, eggs, vegetables",
    priority: "low",
    status: "completed",
    dueDate: "2025-01-30",
    createdAt: "2025-01-28"
  },
  {
    id: 3,
    title: "Schedule dentist appointment",
    description: "",
    priority: "medium",
    status: "pending",
    dueDate: "2025-02-05",
    createdAt: "2025-01-27"
  },
  {
    id: 4,
    title: "Reply to client email",
    description: "Respond to ABC Corp about the proposal",
    priority: "high",
    status: "pending",
    dueDate: "2026-10-01",
    createdAt: "2025-01-29"
  },
  {
    id: 5,
    title: "Pay electricity bill",
    description: "",
    priority: "medium",
    status: "completed",
    dueDate: "2025-01-25",
    createdAt: "2025-01-20"
  }
];


function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    dueDate: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [deleteTaskId, setDeleteTaskId] = useState(null);

const [darkMode, setDarkMode] = useState(
  localStorage.getItem("theme") === "dark"
);

const isOverdue = (task) => {
  if (!task.dueDate || task.completed) return false;

  const today = new Date().toISOString().split("T")[0];
  return task.dueDate < today;
};



useEffect(() => {
  setTasks(initialTasks);
}, []);


 
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
  localStorage.setItem("theme", darkMode ? "dark" : "light");

  if (darkMode) {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }
}, [darkMode]);

const handleDragEnd = (result) => {
  if (!result.destination) return;

  const items = Array.from(tasks);
  const [movedItem] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, movedItem);

  setTasks(items);
};


  const filteredTasks = tasks.filter((task) => {
    
    const matchesFilter =
      filter === "All" ||
      (filter === "Pending" && !task.completed) ||
      (filter === "Completed" && task.completed);

   const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());

  return matchesFilter && matchesSearch;
});

const sortedTasks = filteredTasks;



  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => {
      setMessage("");
    }, 1000); 
  };

  const validate = () => {
    const newErrors = {};

    if (formData.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    }

    if (!formData.priority) {
      newErrors.priority = "Priority is required";
    }

    if (formData.dueDate) {
      const today = new Date().toISOString().split("T")[0];
      if (formData.dueDate < today) {
        newErrors.dueDate = "Due date cannot be in the past";
      }
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (editTask) {
      setTasks(
        tasks.map((t) => (t.id === editTask.id ? { ...t, ...formData } : t))
      );
      showMessage("Task updated successfully!");
    } else {
      setTasks([
  {
    id: Date.now(),
    ...formData,
    completed: false,
  },
  ...tasks,
]);

      showMessage("Task added successfully!");
    }

    setShowForm(false);
    setEditTask(null);
    setFormData({ title: "", description: "", priority: "", dueDate: "" });
    setErrors({});
  };

  

  return (
<div className={`app ${darkMode ? "dark" : ""}`}>
   <div className="header">
  <h1>TaskFlow</h1>

  <div className="header-actions">
    <button
      onClick={() => {
        setFormData({
          title: "",
          description: "",
          priority: "",
          dueDate: "",
        });
        setEditTask(null);
        setErrors({});
        setShowForm(true);
      }}
    >
      + Add Task
    </button>

    <button onClick={() => setDarkMode(prev => !prev)}>
      {darkMode ? "☀ Light" : "🌙 Dark"}
    </button>
  </div>
</div>




      {message && <p className="success">{message}</p>}

      <div className="search-box">
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setMessage("");
          }}
        />
      </div>

      <div className="filters">
        {["All", "Pending", "Completed"].map((f) => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => {
              setFilter(f);
              setMessage("");
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <p className="empty">
          {search
            ? "No tasks found for your search"
            : "No tasks yet. Add your first task!"}
        </p>
      )}

    <DragDropContext onDragEnd={handleDragEnd}>
  <Droppable droppableId="tasks">
    {(provided) => (
      <ul ref={provided.innerRef} {...provided.droppableProps}>
        {sortedTasks.map((task, index) => (
          <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
            {(provided, snapshot) => (
           <li
  ref={provided.innerRef}
  {...provided.draggableProps}
  {...provided.dragHandleProps}
className={`
  ${task.completed ? "completed" : ""}
  ${isOverdue(task) ? "overdue" : ""}
  ${snapshot.isDragging ? "dragging" : ""}
`}
  style={{
    ...provided.draggableProps.style,
  }}
>


                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => {
                    setMessage("");
                    setTasks(
                      tasks.map((t) =>
                        t.id === task.id
                          ? { ...t, completed: !t.completed }
                          : t
                      )
                    );
                  }}
                />
                <span>
                  {task.title}
                  <small className={`badge ${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </small>
                  {task.dueDate && <small> Due: {formatDate(task.dueDate)}</small>}
                </span>
                <button
                  onClick={() => {
                    setEditTask(task);
                    setFormData(task);
                    setShowForm(true);
                  }}
                >
                  Edit
                </button>
                <button onClick={() => setDeleteTaskId(task.id)}>Delete</button>
              </li>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </ul>
    )}
  </Droppable>
</DragDropContext>


      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editTask ? "Edit Task" : "Add Task"}</h2>

            <label style={{ marginBottom: "5px" }}>
              Title <span style={{ color: "red" }}>*</span>
            </label>

            <input
              className={errors.title ? "input-error" : ""}
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            {errors.title && <small className="error">{errors.title}</small>}

            <label style={{ marginBottom: "5px" }}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />

            <label style={{ marginBottom: "5px" }}>
              Priority <span style={{ color: "red" }}>*</span>
            </label>
            <select
              className={errors.priority ? "input-error" : ""}
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
            >
              <option value="">Select Priority</option>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
            {errors.priority && (
              <small className="error">{errors.priority}</small>
            )}

            <label style={{ marginBottom: "5px" }}>Due Date</label>
            <input
              type="date"
              className={errors.dueDate ? "input-error" : ""}
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
            />
            {errors.dueDate && (
              <small className="error">{errors.dueDate}</small>
            )}

            <div className="actions">
              <button onClick={handleSubmit}>
                {editTask ? "Update Task" : "Save Task"}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditTask(null);
                  setErrors({});
                  setFormData({
                    title: "",
                    description: "",
                    priority: "",
                    dueDate: "",
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        
      )}

      {deleteTaskId !== null && (
  <div className="modal">
    <div className="modal-content">
      <h3>Are you sure you want to delete this task?</h3>
      <div className="actions">
        <button
          onClick={() => {
            setTasks(tasks.filter((t) => t.id !== deleteTaskId));
            showMessage("Task deleted successfully!");
            setDeleteTaskId(null); 
          }}
          style={{ backgroundColor: "red", color: "white" }}
        >
          Yes, Delete
        </button>
        <button
          onClick={() => setDeleteTaskId(null)}
          style={{ backgroundColor: "gray", color: "white" }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default App;
