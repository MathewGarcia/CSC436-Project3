import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "@/util/supabase";
import { getCurrentUser } from "@/util/data";

const Header = () => {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    };
    fetchCurrentUser();

    supabase.auth.onAuthStateChange(async () => {
      const user = await getCurrentUser();
      setCurrentUser(user);
    });
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  };

  return (
    <header className={"flex bg-black justify-between items-center"}>
      <div className={"flex"}>
        <Link href={"/home"}>
          <h1 className={"text-white mr-4"}>Home</h1>
        </Link>
      </div>
      <div className="flex items-center">
        {currentUser && (
          <>
            <h1 className={"text-white mr-4"}>
              Welcome,{" "}
              <Link href={`/profile/${currentUser.id}`}>
                {currentUser.username}
              </Link>
              !
            </h1>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="text-white bg-red-500 rounded-md py-2 px-4"
            >
              {loading ? "Logging out..." : "Logout"}
            </button>
          </>
        )}
        {!currentUser && (
          <Link href={"/login"}>
            <h1 className={"text-white"}>Login</h1>
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
