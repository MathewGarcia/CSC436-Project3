import { useState, useEffect } from "react";
import { loginUser, getCurrentUser } from "../util/data";
import Link from "next/link";
import { useRouter } from "next/router";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [response, setResponse] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [hide, setHide] = useState(true);
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setLoading(false);
    };
    fetchCurrentUser();
  }, [currentUser]);

  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authResponse = await loginUser(email, password);
    const user = await getCurrentUser();
    setResponse(authResponse);
    if (authResponse.success) {
      router.push(`/profile/${user.id}`);
    }
    if (authResponse.error) {
      setHide(false);
      setMessage(authResponse.error.message);
    }
  };

  return (
    <>
      {!loading && !hide && <div className="error"> {message} </div>}
      {loading && <div>Loading...</div>}
      {!loading && !currentUser && (
        <div className={"login-page "}>
          <form onSubmit={handleSubmit} className={"login-form"}>
            <div className="block">
              <label>Email:</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="block">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit">Submit</button>
            <div>
              <Link className="create-account" href={"/register"}>
                Create an account
              </Link>
            </div>
          </form>
        </div>
      )}
      {!loading && currentUser && (
        <div>You are logged in as: {currentUser.username}</div>
      )}
    </>
  );
};

export default Login;
