import { addTask, getTasks, updatePost } from "@/util/data";
import { useEffect, useState } from "react";
import supabase from "@/util/supabase";
import Link from "next/link";
import { getCurrentUser } from "@/util/data";

const Home = () => {
  const [showForm, setShowForm] = useState(false);
  const [tasks, setTasks] = useState([{ id: 1, value: "" }]);
  const [count, setCount] = useState(1);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [allTasks, setAllTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setLoading(true);

    const fetchUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchUser();
    getTasks()
      .then((data) => {
        setAllTasks(data);
      })
      .finally(setLoading(false));

    setMessage("");
  }, []);

  const createForm = () => {
    if (currentUser != null) {
      setShowForm(!showForm);
      if (!showForm) {
        setTasks((tasks) => [...tasks, { id: count + 1, value: "" }]);
        setCount(count + 1);
      }
      if (showForm) {
        setTitle("");
        setTasks([{ id: 1, value: "" }]);
        setCount(1);
      }
    }
  };

  const toggleTaskPriority = async (postId, currentPriority) => {
    const newPriority = currentPriority === 1 ? 0 : 1;
    await updatePost(postId, { priority: newPriority });

    setAllTasks((prevTasks) => {
      return prevTasks.map((task) => {
        if (task.id === postId) {
          return { ...task, priority: newPriority };
        } else {
          return task;
        }
      });
    });
  };

  const handleTaskChange = async (event, id) => {
    const newTasks = [...tasks];
    const index = newTasks.findIndex((task) => task.id === id);
    newTasks[index].value = event.target.value;
    setTasks(newTasks);
  };

  const handleTaskDelete = async (id) => {
    const newTasks = tasks.filter((task) => task.id !== id);

    // Update the IDs of the remaining tasks
    const updatedTasks = newTasks.map((task, index) => {
      return {
        ...task,
        id: index + 1,
      };
    });

    setTasks(updatedTasks);
    setCount(count - 1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await addTask(title, tasks);

    // Retrieve updated list of tasks
    const { data } = await supabase.from("todos").select("*");
    setAllTasks(data);

    // Reset the form
    setTitle("");
    setTasks([{ id: 1, value: "" }]);
    setCount(1);
    setShowForm(false);
  };

  return (
    <div>
      <div className="tooltip">
        <button
          className={"plus-sign mx-2 my-2"}
          onClick={() => {
            if (!currentUser) {
              setMessage("Please login to create a new list");
            }
            createForm();
          }}
        >
          {" "}
        </button>
        <span className="tooltiptext">
          {showForm ? "Close" : "Create new post"}
        </span>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit}>
          <label>Title:</label>
          <input
            className="border border-gray-400 p-2"
            onChange={(e) => setTitle(e.target.value)}
          ></input>
          {tasks.map((task) => (
            <div key={task.id}>
              <label>Task {task.id}:</label>
              <input
                className="border border-gray-400 p-2"
                value={task.value}
                onChange={(e) => handleTaskChange(e, task.id)}
                onBlur={(e) => handleTaskChange(e, task.id)}
              />

              <button type="button" onClick={() => handleTaskDelete(task.id)}>
                X
              </button>
            </div>
          ))}
          <button
            className={"circle-plus-sign mx-2 my-2"}
            onClick={(e) => {
              e.preventDefault();
              setTasks((tasks) => [...tasks, { id: count + 1, value: "" }]);
              setCount(count + 1);
            }}
          ></button>
          <button type="submit"> Submit </button>
        </form>
      )}

      {loading && <p>Loading</p>}
      {!loading &&
        allTasks
          .sort((a, b) => {
            return b.priority - a.priority;
          })
          .map((task) => {
            return (
              <div key={task.id} className={"card"}>
                <button
                  className={
                    task.priority === 1 ? "filled-star" : "hollow-star"
                  }
                  onClick={() => toggleTaskPriority(task.id, task.priority)}
                />
                <Link href={`/task/${task.id}`}>
                  <p className={" flex justify-center card-content"}>
                    <Link href={`/task/${task.id}`}>{task.title}</Link>
                  </p>
                  <p className="flex justify-center">
                    {" "}
                    <Link
                      className={"link-to"}
                      href={`/profile/${task.user_id}`}
                    >
                      <small>Created by : {task.userName}</small>
                    </Link>
                  </p>
                </Link>
              </div>
            );
          })}
      {!loading && !currentUser && message && (
        <div className={"error"}>{message} </div>
      )}
    </div>
  );
};

export default Home;
