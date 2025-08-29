import React, { useEffect, useState } from "react";
import axios from "axios";
import EmailCard from "./components/EmailCard.jsx";
import Loader from "./components/Loader.jsx";

function App() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:3000/emails").then((res) => {
      setEmails(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📧 Smart Email Dashboard</h1>
      {loading ? <Loader /> : (
        <div className="space-y-4">
          {emails.map((email) => (
            <EmailCard key={email.id} email={email} />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
