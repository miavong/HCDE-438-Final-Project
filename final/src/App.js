import './App.css';
import React, { useState, useEffect } from "react";
import { db } from "./firebase"; // Import the initialized Firestore database
import { collection, addDoc, getDocs } from "firebase/firestore";

function App() {
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [results, setResults] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    const fetchSavedJobs = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "jobs"));
        const jobs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSavedJobs(jobs);
      } catch (error) {
        console.error("Error fetching saved jobs: ", error);
      }
    };
    fetchSavedJobs();
  }, []);

  const handleSearch = async () => {
    const url = "https://jooble.org/api/";
    const key = "11e139a9-52d1-43f1-a99b-514e61ab8a63"; 
    const params = {
      keywords: jobTitle,
      location: location,
    };

    try {
      const response = await fetch(`${url}${key}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`); 
      }

      const data = await response.json(); 
      console.log("API Response:", data);
      setResults(data.jobs ? data.jobs.slice(0, 5) : []); 
    } catch (error) {
      console.error("Failed to find job results:", error);
    }
  };

  const handleSaveJob = async (job) => {
    try {
      // Add the job to Firebase
      const docRef = await addDoc(collection(db, "jobs"), job);
      console.log("Document written with ID: ", docRef.id);

      // Update local state with saved job
      setSavedJobs((prevJobs) => [...prevJobs, { ...job, id: docRef.id }]);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  return (
    <div className="App">
      <header>
        <h1>Find your dream job!</h1>
      </header>
      <div className="search-container">
        <input
          type="text"
          placeholder="Job Title (e.g., Product Manager)"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="Location (e.g., Seattle)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      <div className="results-saved-wrapper">
        <div className="results-container">
          <h2>Search Results</h2>
          {results.length > 0 ? (
            results.map((job, index) => (
              <div className="job-card" key={index}>
                <h3>{job.title}</h3>
                <p>Company: {job.company}</p>
                <p>Location: {job.location}</p>
                <p>Salary: {job.salary || "Not specified"}</p>
                <a href={job.link} target="_blank" rel="noopener noreferrer">
                  View Job
                </a>
                <p>
                <button className="save-button" onClick={() => handleSaveJob(job)}>Save</button>
                </p>
              </div>
            ))
          ) : (
            <p>No results found. Try another search.</p>
          )}
        </div>
        <div className="saved-container">
          <h2>Saved Jobs</h2>
          {savedJobs.map((job, index) => (
            <div className="saved-job" key={index}>
              <h3>{job.title}</h3>
              <p>{job.company}</p>
              <p>{job.location}</p>
              <a href={job.link} target="_blank" rel="noopener noreferrer">
                View Job
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;

