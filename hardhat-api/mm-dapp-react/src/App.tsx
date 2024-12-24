import './App.css'
import { useState, useEffect } from 'react'
import detectEthereumProvider from '@metamask/detect-provider'
import { ethers } from "ethers";

const App = () => {
  const [hasProvider, setHasProvider] = useState<boolean | null>(null)
  const initialState = { accounts: [] }
  const [wallet, setWallet] = useState(initialState)
  const [formData, setFormData] = useState({
    mlName: "",
    modelType: "",
    receiver: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }

  useEffect(() => { 
    const refreshAccounts = (accounts: any) => {                /* New */
      if (accounts.length > 0) {                                /* New */
        updateWallet(accounts)                                  /* New */
      } else {                                                  /* New */
        // if length 0, user is disconnected                    /* New */
        setWallet(initialState)                                 /* New */
      }                                                         /* New */
    }                                                           /* New */

    const getProvider = async () => {
      const provider = await detectEthereumProvider({ silent: true })
      setHasProvider(Boolean(provider))

      if (provider) {                                           /* New */
        const accounts = await window.ethereum.request(         /* New */
          { method: 'eth_accounts' }                            /* New */
        )                                                       /* New */
        refreshAccounts(accounts)                               /* New */
        window.ethereum.on('accountsChanged', refreshAccounts)  /* New */
      }                                                         /* New */
    }

    getProvider()
    return () => {                                              /* New */
      window.ethereum?.removeListener('accountsChanged', refreshAccounts)
    }                                                           /* New */
  }, [])

  const updateWallet = async (accounts:any) => {
    setWallet({ accounts })
  }

  const handleConnect = async () => {
    let accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })
    updateWallet(accounts)
  }

  const handleSignAndPing = async () => {
    try {
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      const message = "Please sign this message to authenticate with the server.";
      const signature = await signer.signMessage(message); // User signs the message
      const walletAddress = await signer.getAddress();
  
      // Send the signature and wallet address to the backend
      const response = await fetch("http://localhost:8080/pingContract", {
        method: "GET"
        // headers: { "Content-Type": "application/json" },
        // body: JSON.stringify({ walletAddress, signature }),
      });
  
      const data = await response.json();
      console.log("Backend Response:", data.message || data.error);
    } catch (error) {
      console.error("Error in signing or fetching:", error);
    }
  };

  const handleSendFile = async () => {
    try {
      
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      const message = "Please sign this message to authenticate with the server.";
      const signature = await signer.signMessage(message); // User signs the message
      const walletAddress = await signer.getAddress();
      const recoveredAddress = ethers.utils.verifyMessage(message, signature);

      if(recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        console.error("Signature verification failed");
        return;
      }

      console.log("Signature verified : " + recoveredAddress + " " + walletAddress);

      const mlName = formData.mlName;
      const owner = wallet.accounts[0];
      const modelType = formData.modelType;
      const receiver = formData.receiver;
      // Send the signature and wallet address to the backend
      const response = await fetch("http://localhost:8080/sendFile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mlName, modelType, owner, receiver }),
      });
  
      const data = await response.json();
      console.log("Backend Response:", data.message || data.error);
    } catch (error) {
      console.error("Error in signing or fetching:", error);
    }
  };

  return (
    <div className="App">
      <div>Injected Provider {hasProvider ? 'DOES' : 'DOES NOT'} Exist</div>

      { window.ethereum?.isMetaMask && wallet.accounts.length < 1 &&  /* Updated */
        <button onClick={handleConnect}>Connect MetaMask</button>
      }

      { wallet.accounts.length > 0 &&
        <div>Wallet Accounts: { wallet.accounts[0] }</div>
      }

      {wallet.accounts.length > 0 && (
        <button onClick={handleSignAndPing}>Ping Contract</button>
      )}

      {wallet.accounts.length > 0 && (
        <div>
          <div>
            <label htmlFor="mlName">mlName : </label>
            <input 
              type="text"
              id="mlName"
              name="mlName"
              onChange={handleInputChange}
              value={formData.mlName}
              className="form-input" /* Using className for styling the input field */
            />
          </div>

          <div>
            <label htmlFor="modelType">Model Type : </label>
            <input 
              type="text"
              id="modelType"
              name="modelType"
              onChange={handleInputChange}
              value={formData.modelType}
              className="form-input" /* Using className for styling the input field */
            />
          </div>

          <div>
            <label htmlFor="receiver">Receiver Address : </label>
            <input 
              type="text"
              id="receiver"
              name="receiver"
              onChange={handleInputChange}
              value={formData.receiver}
              className="form-input" /* Using className for styling the input field */
            />
          </div>

          <button 
            type='submit'
            onClick={handleSendFile}>Send File</button>
        </div>
      )}
    </div>
  )
}

export default App