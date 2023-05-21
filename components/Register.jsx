import React, { useState } from "react";
import { useReducer } from "react";
import { useRouter } from "next/router";
import { registerUser } from "@/util/data";

const Register = () => {
  function reducer(state, action) {
    switch (action.type) {
      case "email":
      case "username":
      case "password":
        return { ...state, [action.type]: action.value };
      case "loading":
        return { ...state, loading: action.loading };
      case "response":
        return { ...state, response: action.response };
    }
    throw Error("Unknown Action");
  }
  const initialState = {
    email: "",
    username: "",
    password: "",
    response: "",
    loading: false,
  };

  const [state, dispatch] = useReducer(reducer, initialState);
  const { email, username, password, response, loading } = state;
  const router = useRouter();
  const [hide, setHide] = useState(true);
  const [message, setMessage] = useState("");

  const register = async (e) => {
    dispatch({ type: "loading", loading: true });
    e.preventDefault();

    const response = await registerUser(email, password, username);
    dispatch({ type: "response", response });
    dispatch({ type: "loading", loading: false });
    if (!!response?.success) {
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }

    if (response.message) {
      setHide(false);
      setMessage(response.message);
      console.log(message);
    }
  };

  return (
    <>
      {!hide && <div className="error"> {message} </div>}
      <div className={"login-page"}>
        <form onSubmit={register} className="login-form contianer">
          <div className="block">
            <label>Email:</label>
            <input
              onChange={(e) =>
                dispatch({ type: "email", value: e.target.value })
              }
            ></input>
          </div>
          <div className="block">
            <label>Password:</label>
            <input
              onChange={(e) =>
                dispatch({ type: "password", value: e.target.value })
              }
            ></input>
          </div>
          <div className="block">
            <label>Username:</label>
            <input
              onChange={(e) =>
                dispatch({ type: "username", value: e.target.value })
              }
            ></input>
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  );
};

export default Register;
