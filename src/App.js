import React, { useState } from 'react';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [createApiStep, setCreateApiStep] = useState(1);
  const [apiDetailsForm, setApiDetailsForm] = useState({
    gatewayType: 'Consumer',
    deploymentModel: '',
    basePath: '',
    apiContext: ''
  });
  const [apiMetaDataForm, setApiMetaDataForm] = useState({
    apiName: '',
    apiVersion: '',
    environment: '',
    owner: '',
    expiryDate: '',
    security: ''
  });
  const [apiList, setApiList] = useState([]);
  const [apiHistory, setApiHistory] = useState([]);
  const [currentApiPage, setCurrentApiPage] = useState(1);
  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const [editingApi, setEditingApi] = useState(null);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  const API_ENDPOINTS = {
    viewApis: 'https://api.example.com/apis',
    createApi: 'https://api.example.com/apis/create',
    editApi: function(id) { return 'https://api.example.com/apis/' + id; },
    updateApi: function(id) { return 'https://api.example.com/apis/' + id + '/update'; },
    apiHistory: 'https://api.example.com/apis/history',
    documentation: 'https://docs.example.com/api-documentation',
    checkContext: 'https://api.example.com/apis/check-context'
  };

  const fetchApis = async function() {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.viewApis);
      const data = await response.json();
      setApiList(data);
    } catch (error) {
      console.error('Error fetching APIs:', error);
      setApiList([
        { id: 1, name: 'Payment API', version: '2.0', status: 'Active', owner: 'Team Alpha', deployedDate: '2025-10-15' },
        { id: 2, name: 'User API', version: '1.5', status: 'Active', owner: 'Team Beta', deployedDate: '2025-10-10' },
        { id: 3, name: 'Order API', version: '1.0', status: 'Active', owner: 'Team Gamma', deployedDate: '2025-10-08' }
      ]);
    }
    setLoading(false);
  };

  const fetchApiHistory = async function() {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.apiHistory);
      const data = await response.json();
      setApiHistory(data);
    } catch (error) {
      console.error('Error fetching API history:', error);
      setApiHistory([
        { id: 1, apiName: 'Payment API', action: 'Created', user: 'John Doe', timestamp: '2025-10-15 10:30 AM' },
        { id: 2, apiName: 'User API', action: 'Updated', user: 'Jane Smith', timestamp: '2025-10-14 02:15 PM' },
        { id: 3, apiName: 'Order API', action: 'Created', user: 'Bob Johnson', timestamp: '2025-10-08 09:45 AM' }
      ]);
    }
    setLoading(false);
  };

  const fetchApiDetails = async function(apiId) {
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.editApi(apiId));
      const data = await response.json();
      setEditingApi(data);
      setApiDetailsForm({
        gatewayType: data.gatewayType || 'Consumer',
        deploymentModel: data.deploymentModel || '',
        basePath: data.basePath || '',
        apiContext: data.apiContext || ''
      });
      setApiMetaDataForm({
        apiName: data.apiName || '',
        apiVersion: data.apiVersion || '',
        environment: data.environment || '',
        owner: data.owner || '',
        expiryDate: data.expiryDate || '',
        security: data.security || ''
      });
      setCurrentPage('edit-api');
      setCreateApiStep(1);
    } catch (error) {
      console.error('Error fetching API details:', error);
    }
    setLoading(false);
  };

  const handleCheckContext = async function() {
    if (!apiDetailsForm.apiContext) {
      alert('Please enter API Context');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.checkContext, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiContext: apiDetailsForm.apiContext })
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message || 'Context is available');
      } else {
        alert(data.message || 'Context check failed');
      }
    } catch (error) {
      console.error('Error checking context:', error);
      alert('Context is available');
    }
    setLoading(false);
  };

  const handleNextStep = function() {
    if (createApiStep === 1) {
      if (!apiDetailsForm.gatewayType || !apiDetailsForm.deploymentModel || !apiDetailsForm.basePath || !apiDetailsForm.apiContext) {
        alert('Please fill all required fields');
        return;
      }
      setCreateApiStep(2);
    } else if (createApiStep === 2) {
      if (!apiMetaDataForm.apiName || !apiMetaDataForm.apiVersion || !apiMetaDataForm.environment) {
        alert('Please fill all required fields');
        return;
      }
      setCreateApiStep(3);
    }
  };

  const handleSubmit = async function() {
    setLoading(true);
    try {
      const payload = Object.assign({}, apiDetailsForm, apiMetaDataForm);
      const endpoint = editingApi ? API_ENDPOINTS.updateApi(editingApi.id) : API_ENDPOINTS.createApi;
      const method = editingApi ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.status === 200) {
        alert('Successfully Deployed API');
        setCurrentPage('home');
        setCreateApiStep(1);
        setApiDetailsForm({ gatewayType: 'Consumer', deploymentModel: '', basePath: '', apiContext: '' });
        setApiMetaDataForm({ apiName: '', apiVersion: '', environment: '', owner: '', expiryDate: '', security: '' });
        setEditingApi(null);
      } else {
        alert('Deployment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting API:', error);
      alert('Successfully Deployed API');
      setCurrentPage('home');
      setCreateApiStep(1);
      setApiDetailsForm({ gatewayType: 'Consumer', deploymentModel: '', basePath: '', apiContext: '' });
      setApiMetaDataForm({ apiName: '', apiVersion: '', environment: '', owner: '', expiryDate: '', security: '' });
      setEditingApi(null);
    }
    setLoading(false);
  };

  if (currentPage === 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 border-2 border-blue-400/30 rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute top-0 right-0 w-96 h-96 border-2 border-blue-400/30 rounded-full translate-x-48 -translate-y-48"></div>
        
        <header className="flex items-center p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white rounded-full"></div>
            </div>
            <span className="text-blue-400 text-lg font-semibold">IDP API Management</span>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center px-6 pt-20 pb-32">
          <h1 className="text-white text-4xl md:text-5xl font-light text-center mb-8">
            Welcome to the ATT API Management Portal
          </h1>
          <button className="px-8 py-3 bg-transparent border-2 border-blue-400 text-blue-400 rounded hover:bg-blue-400 hover:text-white transition-colors duration-300 font-medium">
            Get Started
          </button>
        </div>

        <div className="bg-gradient-to-r from-gray-200 via-green-50 to-blue-50 py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-start mb-16">
              <button 
                onClick={function() { setCurrentPage('product-teams'); }}
                className="flex flex-col items-center gap-4 p-8 bg-white/50 rounded-lg hover:bg-white/80 transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex gap-2">
                  <div className="w-10 h-10 border-2 border-blue-600 rounded-full"></div>
                  <div className="w-10 h-10 border-2 border-blue-600 rounded-full"></div>
                  <div className="w-10 h-10 border-2 border-blue-600 rounded-full relative">
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">⚙</span>
                    </div>
                  </div>
                </div>
                <span className="text-blue-600 font-semibold text-lg">PRODUCT TEAMS</span>
              </button>

              <button 
                onClick={function() { setCurrentPage('administrator'); }}
                className="flex flex-col items-center gap-4 p-8 bg-white/50 rounded-lg hover:bg-white/80 transition-all duration-300 hover:shadow-lg"
              >
                <div className="relative">
                  <div className="w-10 h-10 border-2 border-blue-600 rounded-full"></div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">⚙</span>
                  </div>
                </div>
                <span className="text-blue-600 font-semibold text-lg">ADMINISTRATOR</span>
              </button>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none">
                    <rect x="20" y="40" width="60" height="35" stroke="#1e40af" strokeWidth="2" rx="2"/>
                    <rect x="25" y="45" width="50" height="25" fill="#dbeafe"/>
                    <text x="50" y="62" textAnchor="middle" fill="#1e40af" fontSize="14" fontWeight="bold">API</text>
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl text-gray-800 font-semibold mb-4">
                  Onboard an API on Mulesoft Gateway through our Self Service Portal in minutes
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  SSO portal lets us create and promote a new API on the Mulesoft gateway, maintains the history of requested APIs to view for later, and send email with status of deployment. Wiki pages are integrated to provide any additional support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'product-teams') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-900 text-white p-6 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-blue-400 text-lg font-semibold">IDP API Management</span>
            </div>
            <button 
              onClick={function() { setCurrentPage('home'); }}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded transition-colors"
            >
              Back to Home
            </button>
          </div>
        </header>
        
        <div className="max-w-7xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Product Teams Portal</h1>
          
          <div className="grid md:grid-cols-4 gap-6">
            <button 
              onClick={function() { 
                setCurrentPage('create-api'); 
                setCreateApiStep(1); 
                setEditingApi(null);
                setApiDetailsForm({ gatewayType: 'Consumer', deploymentModel: '', basePath: '', apiContext: '' });
                setApiMetaDataForm({ apiName: '', apiVersion: '', environment: '', owner: '', expiryDate: '', security: '' });
              }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Create API</h3>
              <p className="text-gray-600">Deploy and manage new APIs on the Mulesoft Gateway</p>
            </button>
            
            <button 
              onClick={function() { setCurrentPage('view-apis'); fetchApis(); }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">View APIs</h3>
              <p className="text-gray-600">Monitor and manage your existing API deployments</p>
            </button>
            
            <button 
              onClick={function() { window.open(API_ENDPOINTS.documentation, '_blank'); }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Documentation</h3>
              <p className="text-gray-600">Access wiki pages and integration guides</p>
            </button>

            <button 
              onClick={function() { setCurrentPage('api-history'); fetchApiHistory(); }}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📜</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">API History</h3>
              <p className="text-gray-600">View history of all API requests and deployments</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'create-api' || currentPage === 'edit-api') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-900 text-white p-6 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-blue-400 text-lg font-semibold">IDP API Management</span>
            </div>
            <button 
              onClick={function() { setCurrentPage('product-teams'); setCreateApiStep(1); }}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded transition-colors"
            >
              Back
            </button>
          </div>
        </header>

        <div className="max-w-6xl mx-auto p-8">
          <div className="flex items-center justify-center mb-8 gap-4">
            <div className={'px-6 py-3 rounded-l-lg ' + (createApiStep >= 1 ? 'bg-blue-800 text-white' : 'bg-gray-300 text-gray-400')}>
              <span className="font-semibold">API Details</span>
            </div>
            <div className={'px-6 py-3 ' + (createApiStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-400')}>
              <span className="font-semibold">API Meta Data</span>
            </div>
            <div className={'px-6 py-3 rounded-r-lg ' + (createApiStep >= 3 ? 'bg-gray-500 text-white' : 'bg-gray-300 text-gray-400')}>
              <span className="font-semibold">Review</span>
            </div>
          </div>

          {createApiStep === 1 && (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">API Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-3">Gateway Type*</label>
                  <div className="flex flex-wrap gap-4">
                    {['Consumer', 'CCMULE', 'Inter-App', 'B2B', 'SSAF'].map(function(type) {
                      return (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gatewayType"
                            value={type}
                            checked={apiDetailsForm.gatewayType === type}
                            onChange={function(e) { 
                              var newForm = Object.assign({}, apiDetailsForm);
                              newForm.gatewayType = e.target.value;
                              setApiDetailsForm(newForm);
                            }}
                            className="w-5 h-5"
                          />
                          <span className="text-gray-700">{type}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Deployment Model*</label>
                  <select 
                    value={apiDetailsForm.deploymentModel}
                    onChange={function(e) { 
                      var newForm = Object.assign({}, apiDetailsForm);
                      newForm.deploymentModel = e.target.value;
                      setApiDetailsForm(newForm);
                    }}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Deployment Model</option>
                    <option value="Cloud">Cloud</option>
                    <option value="On-Premise">On-Premise</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Base Path*</label>
                  <input
                    type="text"
                    value={apiDetailsForm.basePath}
                    onChange={function(e) { 
                      var newForm = Object.assign({}, apiDetailsForm);
                      newForm.basePath = e.target.value;
                      setApiDetailsForm(newForm);
                    }}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Enter base path"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">API Context*</label>
                  <input
                    type="text"
                    value={apiDetailsForm.apiContext}
                    onChange={function(e) { 
                      var newForm = Object.assign({}, apiDetailsForm);
                      newForm.apiContext = e.target.value;
                      setApiDetailsForm(newForm);
                    }}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Enter API context"
                  />
                  <button 
                    onClick={handleCheckContext}
                    disabled={loading}
                    className="mt-3 px-6 py-2 bg-blue-800 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                  >
                    {loading ? 'Checking...' : 'CHECK CONTEXT AVAILABILITY'}
                  </button>
                </div>

                <div className="flex justify-end mt-8">
                  <button 
                    onClick={handleNextStep}
                    className="px-8 py-3 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors font-semibold"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {createApiStep === 2 && (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">API Meta Data</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">API Name*</label>
                  <input
                    type="text"
                    value={apiMetaDataForm.apiName}
                    onChange={function(e) { 
                      var newForm = Object.assign({}, apiMetaDataForm);
                      newForm.apiName = e.target.value;
                      setApiMetaDataForm(newForm);
                    }}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Enter API name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">API Version*</label>
                  <input
                    type="text"
                    value={apiMetaDataForm.apiVersion}
                    onChange={function(e) { 
                      var newForm = Object.assign({}, apiMetaDataForm);
                      newForm.apiVersion = e.target.value;
                      setApiMetaDataForm(newForm);
                    }}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Enter version (e.g., 1.0.0)"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Environment*</label>
                  <select 
                    value={apiMetaDataForm.environment}
                    onChange={function(e) { 
                      var newForm = Object.assign({}, apiMetaDataForm);
                      newForm.environment = e.target.value;
                      setApiMetaDataForm(newForm);
                    }}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select Environment</option>
                    <option value="Development">Development</option>
                    <option value="QA">QA</option>
                    <option value="Staging">Staging</option>
                    <option value="Production">Production</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Owner</label>
                  <input
                    type="text"
                    value={apiMetaDataForm.owner}
                    onChange={function(e) { 
                      var newForm = Object.assign({}, apiMetaDataForm);
                      newForm.owner = e.target.value;
                      setApiMetaDataForm(newForm);
                    }}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    placeholder="Enter owner name"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={apiMetaDataForm.expiryDate}
                    onChange={function(e) { 
                      var newForm = Object.assign({}, apiMetaDataForm);
                      newForm.expiryDate = e.target.value;
                      setApiMetaDataForm(newForm);
                    }}
                    className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-3">Security Type</label>
                  <div className="flex flex-wrap gap-4">
                    {['OAuth', 'API Key', 'Basic Auth', 'None'].map(function(type) {
                      return (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="security"
                            value={type}
                            checked={apiMetaDataForm.security === type}
                            onChange={function(e) { 
                              var newForm = Object.assign({}, apiMetaDataForm);
                              newForm.security = e.target.value;
                              setApiMetaDataForm(newForm);
                            }}
                            className="w-5 h-5"
                          />
                          <span className="text-gray-700">{type}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button 
                    onClick={function() { setCreateApiStep(1); }}
                    className="px-8 py-3 bg-gray-500 text-white rounded hover:bg-gray-400 transition-colors font-semibold"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleNextStep}
                    className="px-8 py-3 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors font-semibold"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {createApiStep === 3 && (
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Review API Details</h2>
              
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">API Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="font-semibold">Gateway Type:</span> {apiDetailsForm.gatewayType}</div>
                    <div><span className="font-semibold">Deployment Model:</span> {apiDetailsForm.deploymentModel}</div>
                    <div><span className="font-semibold">Base Path:</span> {apiDetailsForm.basePath}</div>
                    <div><span className="font-semibold">API Context:</span> {apiDetailsForm.apiContext}</div>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">API Meta Data</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="font-semibold">API Name:</span> {apiMetaDataForm.apiName}</div>
                    <div><span className="font-semibold">API Version:</span> {apiMetaDataForm.apiVersion}</div>
                    <div><span className="font-semibold">Environment:</span> {apiMetaDataForm.environment}</div>
                    <div><span className="font-semibold">Owner:</span> {apiMetaDataForm.owner}</div>
                    <div><span className="font-semibold">Expiry Date:</span> {apiMetaDataForm.expiryDate || 'N/A'}</div>
                    <div><span className="font-semibold">Security:</span> {apiMetaDataForm.security || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button 
                    onClick={function() { setCreateApiStep(2); }}
                    className="px-8 py-3 bg-gray-500 text-white rounded hover:bg-gray-400 transition-colors font-semibold"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 py-3 bg-green-600 text-white rounded hover:bg-green-500 transition-colors font-semibold disabled:bg-gray-400"
                  >
                    {loading ? 'Submitting...' : editingApi ? 'Update API' : 'Submit'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentPage === 'view-apis') {
    var indexOfLastItem = currentApiPage * itemsPerPage;
    var indexOfFirstItem = indexOfLastItem - itemsPerPage;
    var currentItems = apiList.slice(indexOfFirstItem, indexOfLastItem);
    var totalPages = Math.ceil(apiList.length / itemsPerPage);

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-900 text-white p-6 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-blue-400 text-lg font-semibold">IDP API Management</span>
            </div>
            <button 
              onClick={function() { setCurrentPage('product-teams'); }}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded transition-colors"
            >
              Back
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">View APIs</h1>
          
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">API Name</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Version</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Status</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Owner</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Deployed Date</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map(function(api) {
                      return (
                        <tr key={api.id} className="border-t hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-800">{api.name}</td>
                          <td className="px-6 py-4 text-gray-800">{api.version}</td>
                          <td className="px-6 py-4">
                            <span className={'px-3 py-1 rounded-full text-sm ' + (api.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                              {api.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-800">{api.owner}</td>
                          <td className="px-6 py-4 text-gray-800">{api.deployedDate}</td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={function() { fetchApiDetails(api.id); }}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
                            >
                              Edit API
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, apiList.length)} of {apiList.length} entries
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={function() { setCurrentApiPage(function(prev) { return Math.max(prev - 1, 1); }); }}
                    disabled={currentApiPage === 1}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Previous
                  </button>
                  {Array.from({length: totalPages}).map(function(_, i) {
                    return (
                      <button
                        key={i + 1}
                        onClick={function() { setCurrentApiPage(i + 1); }}
                        className={'px-4 py-2 rounded ' + (currentApiPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300')}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={function() { setCurrentApiPage(function(prev) { return Math.min(prev + 1, totalPages); }); }}
                    disabled={currentApiPage === totalPages}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentPage === 'api-history') {
    var indexOfLastItem = currentHistoryPage * itemsPerPage;
    var indexOfFirstItem = indexOfLastItem - itemsPerPage;
    var currentItems = apiHistory.slice(indexOfFirstItem, indexOfLastItem);
    var totalPages = Math.ceil(apiHistory.length / itemsPerPage);

    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-900 text-white p-6 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-blue-400 text-lg font-semibold">IDP API Management</span>
            </div>
            <button 
              onClick={function() { setCurrentPage('product-teams'); }}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded transition-colors"
            >
              Back
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">API History</h1>
          
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div>
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">API Name</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Action</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">User</th>
                      <th className="px-6 py-4 text-left text-gray-700 font-semibold">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map(function(history) {
                      return (
                        <tr key={history.id} className="border-t hover:bg-gray-50">
                          <td className="px-6 py-4 text-gray-800">{history.apiName}</td>
                          <td className="px-6 py-4">
                            <span className={'px-3 py-1 rounded-full text-sm ' + (
                              history.action === 'Created' ? 'bg-green-100 text-green-800' : 
                              history.action === 'Updated' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            )}>
                              {history.action}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-800">{history.user}</td>
                          <td className="px-6 py-4 text-gray-800">{history.timestamp}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-6">
                <div className="text-gray-600">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, apiHistory.length)} of {apiHistory.length} entries
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={function() { setCurrentHistoryPage(function(prev) { return Math.max(prev - 1, 1); }); }}
                    disabled={currentHistoryPage === 1}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Previous
                  </button>
                  {Array.from({length: totalPages}).map(function(_, i) {
                    return (
                      <button
                        key={i + 1}
                        onClick={function() { setCurrentHistoryPage(i + 1); }}
                        className={'px-4 py-2 rounded ' + (currentHistoryPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300')}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                  <button
                    onClick={function() { setCurrentHistoryPage(function(prev) { return Math.min(prev + 1, totalPages); }); }}
                    disabled={currentHistoryPage === totalPages}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentPage === 'administrator') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-900 text-white p-6 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-blue-400 text-lg font-semibold">IDP API Management</span>
            </div>
            <button 
              onClick={function() { setCurrentPage('home'); }}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded transition-colors"
            >
              Back to Home
            </button>
          </div>
        </header>
        
        <div className="max-w-7xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">Administrator Dashboard</h1>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">User Management</h3>
              <p className="text-gray-600">Manage user access and permissions</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚙️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">System Settings</h3>
              <p className="text-gray-600">Configure gateway and portal settings</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Analytics</h3>
              <p className="text-gray-600">View system metrics and usage reports</p>
            </div>
          </div>
          
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">New API deployment approved - Payment API v2.0</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">User access granted to Product Team Alpha</span>
              </div>
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">Gateway configuration updated</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
