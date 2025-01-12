import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [formData, setFormData] = useState({
    symptoms: '',
    history: '',
    medications: '',
    file: null,
  });
  const [apiResponse, setApiResponse] = useState('');
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleSubmit = async () => {
    setError(null);
    setApiResponse('');

    try {
      const userMessage = `
        ${formData.symptoms}
        ${formData.history}
        ${formData.medications}
      `.trim();

      const requestData = {
        model: "meta-llama/llama-3.2-3b-instruct:free",
        messages: [
          {
            role: "user",
            content: userMessage,
          }
        ]
      };

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.REACT_APP_OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setApiResponse(result.choices[0].message.content);
    } catch (err) {
      setError(err.message);
      console.error('Error:', err);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Doctor's Appointment Prepper</h1>
      <div className="form-container">
        <textarea
          className="input-field"
          name="symptoms"
          placeholder="Symptoms"
          onChange={handleInputChange}
          rows="2"
        />
        <textarea
          className="input-field"
          name="history"
          placeholder="Medical History"
          onChange={handleInputChange}
          rows="2"
        />
        <textarea
          className="input-field"
          name="medications"
          placeholder="Current Medications"
          onChange={handleInputChange}
          rows="2"
        />
        <input 
          type="file" 
          onChange={handleFileChange}
          className="file-input" 
        />
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        <button className="submit-button" onClick={handleSubmit}>
          Submit
        </button>
      </div>
      
      {apiResponse && (
        <div className="response-container">
          <h2>AI Response:</h2>
          <p>{apiResponse}</p>
        </div>
      )}
    </div>
  );
};

export default App;