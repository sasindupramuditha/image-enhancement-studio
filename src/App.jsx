import Home from "./components/Home";
import './App.css';

const App = () => {
  return (
    <div className="App">
      <div className="header">
        <span className="eyebrow">IMAGE ENHANCEMENT STUDIO</span>
        <h1>AI image enhancer</h1>
        <p>Powered by AI</p>
      </div>
      <Home />
      <div className="footer">
        <p>Upload your images for AI-powered enhancement!</p>
      </div>
    </div>
  );
};

export default App;