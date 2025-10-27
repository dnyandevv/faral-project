import './App.css';
import { useState } from 'react';
import Modal from './components/Modal';
import Error from './components/Error';


function App() {
  const [success, setSuccess] = useState(null);
  const [status, setStatus] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const message = "🪔🎉 Happy Diwali! Here’s your Faral! 🥮🎊";

  const isModalOpen = status === "Allowed" || status === "Denied";

  function handleInputChange(event) {
    if(/^\d*$/.test(event.target.value)){
      setPhoneNumber(event.target.value);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("Loading");

    if(phoneNumber.length !== 10){
      console.log("Enter a valid 10-digit number");
      return;
    }
  
    try {
      const res = await fetch('http://localhost:3000/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ number: phoneNumber, message })
      });
      const data = await res.json();
      setSuccess(data.token);
      setStatus(data.token);
    } catch(err){
      console.error("Error sending message:", err);
    }
  }

  return (

    

    <div className="App">

      
      <Modal open={isModalOpen} onClose={() => setStatus(null)}>
        <Error 
          title={success === "Allowed" ? "🎉 Success!" : "⚠️ Sorry!"} 
          message={success === "Allowed" ? 
            "Message sent successfully! Your Faral is on the way! 🥮" :
            "Your number isn't in the whitelist. We'll review it soon."} 
          onConfirm={() => setStatus(null)}
        />
      </Modal>

      <div className="card">
        <h2>🪔 Faral Registration</h2>
        <p>Enter your phone number to receive Diwali Faral!!</p>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Enter 10-digit phone number" 
            maxLength={10} 
            value={phoneNumber}
            onChange={handleInputChange}
          />
          {status === "Loading" ? (
            <button type="submit" className="button" disabled>
              Sending...
            </button>
          ) : (
            <button type="submit">Submit</button>
          )}
        </form>
      </div>
    </div>
  );
}

export default App;
