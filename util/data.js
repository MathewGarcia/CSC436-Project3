import supabase from "@/util/supabase";

const getCurrentUser = async () => {
  const session = await supabase.auth.getSession();
  console.log("session", session);

  if (session?.data?.session?.user) {
    const user = session.data.session.user;
    const { data, error } = await supabase
      .from("project3 profile")
      .select("username")
      .eq("user_id", user.id);

    if (error) {
      console.log(error);
      return null;
    }

    const username = data[0]?.username;

    return { ...user, username };
  }

  return null;
};
const getUserById = async (id) => {
  const { data, error } = await supabase
    .from("project3 profile")
    .select("*")
    .eq("user_id", id)
    .single();

  if (error) {
    console.log("Error fetching user by id:", error.message);
    return null;
  }

  return data;
};

const registerUser = async (email, password, username) => {
  // Check if the username already exists
  const usernameCheck = await supabase
    .from("project3 profile")
    .select("*")
    .eq("username", username);

  if (usernameCheck.error) {
    return {
      success: false,
      message: usernameCheck.error.message,
    };
  }
  if (usernameCheck.data.length > 0) {
    return {
      success: false,
      message: "Username already exists",
    };
  }

  // Check if the email already exists
  const emailCheck = await supabase
    .from("project3 profile")
    .select("*")
    .eq("email", email);

  if (emailCheck.error) {
    return {
      success: false,
      message: emailCheck.error.message,
    };
  }
  if (emailCheck.data.length > 0) {
    return {
      success: false,
      message: "Email already exists",
    };
  }

  const authResponse = await supabase.auth.signUp({
    email,
    password,
  });

  if (authResponse.error) {
    return {
      success: false,
      message: authResponse.error.message,
    };
  }

  if (authResponse.data.user) {
    const addMetaResponse = await supabase
      .from("project3 profile")
      .insert([{ user_id: authResponse.data.user.id, username, email }]);

    if (addMetaResponse.error) {
      return {
        success: false,
        message: addMetaResponse.error.message,
      };
    }
    return {
      success: true,
      ...addMetaResponse.data,
    };
  }

  return {
    success: false,
    message: "An unknown error has occurred",
  };
};

const loginUser = async (email, password) => {
  const authResponse = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authResponse.error) {
    return {
      success: false,
      error: authResponse.error,
    };
  }
  if (authResponse.data.user) {
    const meta = await supabase
      .from("profile")
      .select("*")
      .eq("user_id", authResponse.data.user.id);

    if (meta.error) {
      return {
        success: false,
        error: meta.error,
      };
    }
    return {
      ...authResponse,
      meta,
      success: true,
    };
  }
  return {
    success: false,
    message: "An unknown error has occurred",
  };
};
const addTask = async (title, tasks) => {
  const user = await getCurrentUser();

  const tasksWithCompletion = tasks.map((task, index) => ({
    ...task,
    isCompleted: false,
    order: index + 1,
  }));

  const { data, error } = await supabase
    .from("todos")
    .insert({
      user_id: user.id,
      title,
      tasks: tasksWithCompletion,
      userName: user.username,
    })
    .single();

  if (error) {
    console.log("Error adding task:", error.message);
    return null;
  }

  return data;
};

const getTasks = async () => {
  const { data, error } = await supabase.from("todos").select("*");

  if (error) {
    console.log(error);
  }
  return data;
};

const getTaskById = async (id) => {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.log("Error fetching task by id:", error.message);
    return null;
  }

  return data;
};

const getTasksByUserId = async (id) => {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", id);

  if (error) {
    console.log("Error fetching task by id:", error.message);
    return null;
  }

  return data;
};

const updateTask = async (parentTaskId, taskId, updatedTask) => {
  // Retrieve the existing record from the table
  const { data, error } = await supabase
    .from("todos")
    .select("tasks")
    .eq("id", parentTaskId)
    .single();

  if (error) {
    console.error("Error fetching parent task:", error);
    return;
  }

  let taskExists = false;
  // Modify the task within the JSON object
  const tasks = data.tasks.map((task) => {
    if (task.id === taskId) {
      taskExists = true;
      return { ...updatedTask, order: updatedTask.order };
    }
    return task;
  });

  if (!taskExists) {
    tasks.push({ ...updatedTask, id: taskId, order: updatedTask.order + 1 });
  }

  // Update the record in the table with the modified JSON object
  const { data: updatedData, error: updateError } = await supabase
    .from("todos")
    .update({ tasks })
    .eq("id", parentTaskId);

  if (updateError) {
    console.error("Error updating task:", updateError);
    return;
  }

  console.log("Task updated successfully");
};

const updatePost = async (id, updatedData) => {
  const { data, error } = await supabase
    .from("todos")
    .update(updatedData)
    .eq("id", id);

  if (error) {
    console.error("Error updating post:", error);
    return;
  }

  return data;
};

const deleteTask = async (parentTaskId, taskId) => {
  const { data, error } = await supabase
    .from("todos")
    .select("tasks")
    .eq("id", parentTaskId)
    .single();

  if (error) {
    console.error("Error fetching parent task:", error);
    return;
  }
  const tasks = data.tasks.filter((task) => task.id !== taskId);

  const { data: updatedData, error: updateError } = await supabase
    .from("todos")
    .update({ tasks })
    .eq("id", parentTaskId);

  if (updateError) {
    console.error("Error deleting task:", updateError);
    return;
  }

  console.log("Task deleted successfully");
};

export {
  updateTask,
  registerUser,
  loginUser,
  getCurrentUser,
  getUserById,
  getTasksByUserId,
  addTask,
  getTasks,
  deleteTask,
  getTaskById,
  updatePost,
};
