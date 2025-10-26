
import React, { useState, useRef, useCallback } from 'react';
import { ClipboardIcon, CheckIcon, UploadIcon, AlertTriangleIcon } from './component-icons';

type Mode = 'encode' | 'decode';

const CopyButton: React.FC<{ textToCopy: string }> = ({ textToCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    if (!textToCopy || copied) return;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [textToCopy, copied]);

  return (
    <button
      onClick={handleCopy}
      disabled={!textToCopy}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 ${
        copied
          ? 'bg-green-600 text-white'
          : 'bg-gray-600 hover:bg-gray-500 text-gray-200 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed'
      }`}
    >
      {copied ? <CheckIcon className="w-4 h-4" /> : <ClipboardIcon className="w-4 h-4" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
};

export default function App() {
  const [mode, setMode] = useState<Mode>('encode');

  // Encoder state
  const [fileName, setFileName] = useState<string | null>(null);
  const [encodedResult, setEncodedResult] = useState<string>('');
  const [encodeError, setEncodeError] = useState<string>('');
  const [jsonInput, setJsonInput] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Decoder state
  const [base64Input, setBase64Input] = useState<string>('');
  const [decodedResult, setDecodedResult] = useState<string>('');
  const [decodeError, setDecodeError] = useState<string>('');

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (file.type !== 'application/json') {
          setEncodeError('Invalid file type. Please upload a .json file.');
          setFileName(null);
          setEncodedResult('');
          return;
      }
      
      setJsonInput(''); // Clear text input
      setFileName(file.name);
      setEncodedResult('');
      setEncodeError('');
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const encoded = btoa(text);
          setEncodedResult(encoded);
        } catch (err) {
          setEncodeError('Failed to encode the file content.');
        }
      };
      reader.onerror = () => {
        setEncodeError('Failed to read the file.');
      };
      reader.readAsText(file);
    }
  };
  
  const handleEncodeFromText = () => {
    setEncodeError('');
    setEncodedResult('');
    setFileName(null);

    if (!jsonInput.trim()) {
      setEncodeError('JSON input cannot be empty.');
      return;
    }
    try {
      const content = jsonInput.trim();
      // Validate that it's JSON before encoding
      JSON.parse(content); 
      const encoded = btoa(content);
      setEncodedResult(encoded);
    } catch (err) {
      setEncodeError('Invalid JSON format. Please paste valid JSON content.');
    }
  };


  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleDecode = () => {
    setDecodeError('');
    setDecodedResult('');
    if (!base64Input.trim()) {
      setDecodeError('Input cannot be empty.');
      return;
    }
    try {
      const decodedString = atob(base64Input.trim());
      const jsonObject = JSON.parse(decodedString);
      const prettyJson = JSON.stringify(jsonObject, null, 2);
      setDecodedResult(prettyJson);
    } catch (err) {
      setDecodeError('Invalid Base64 string or the decoded content is not valid JSON.');
    }
  };

  const TabButton: React.FC<{ currentMode: Mode; targetMode: Mode; onClick: () => void; children: React.ReactNode }> = ({ currentMode, targetMode, onClick, children }) => (
    <button
      onClick={onClick}
      className={`w-1/2 py-3 text-sm sm:text-base font-semibold transition-colors duration-200 focus:outline-none ${
        currentMode === targetMode ? 'text-white bg-indigo-600' : 'text-gray-400 bg-gray-700/50 hover:bg-gray-700'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-4xl flex-1">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">Service Account Key Utility</h1>
          <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">
            Encode JSON keys to a single-line Base64 string for Vercel/Netlify environment variables, or decode them back.
          </p>
        </header>

        <main className="mt-8 sm:mt-12 bg-gray-800 rounded-xl shadow-2xl ring-1 ring-white/10 overflow-hidden">
          <div className="flex">
            <TabButton currentMode={mode} targetMode="encode" onClick={() => setMode('encode')}>Encode</TabButton>
            <TabButton currentMode={mode} targetMode="decode" onClick={() => setMode('decode')}>Decode</TabButton>
          </div>

          <div className="p-6 sm:p-8">
            {mode === 'encode' ? (
              <div className="space-y-6">
                <div>
                    <input
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                        className="hidden"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className="relative block w-full rounded-lg border-2 border-dashed border-gray-500 p-8 text-center hover:border-indigo-400 transition-colors duration-200 cursor-pointer"
                    >
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-400"/>
                        <span className="mt-2 block text-sm font-semibold text-white">
                            {fileName ? fileName : 'Upload a service account JSON file'}
                        </span>
                        <span className="block text-xs text-gray-400">
                            or drag and drop
                        </span>
                    </label>
                </div>
                
                <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="json-input" className="block text-sm font-medium text-gray-300 mb-2">
                      Paste your JSON content
                    </label>
                    <textarea
                      id="json-input"
                      rows={8}
                      value={jsonInput}
                      onChange={(e) => {
                          setJsonInput(e.target.value);
                          setFileName(null);
                      }}
                      placeholder="Paste your service account JSON content here..."
                      className="w-full bg-gray-900/80 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    ></textarea>
                  </div>
                  <div className="text-center">
                      <button onClick={handleEncodeFromText} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">
                          Encode
                      </button>
                  </div>
                </div>

                {encodeError && (
                  <div className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 rounded-md flex items-center gap-3">
                    <AlertTriangleIcon className="w-5 h-5" />
                    <span className="text-sm">{encodeError}</span>
                  </div>
                )}
                {encodedResult && (
                  <div className="bg-gray-900/70 rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center p-3 bg-gray-700/50">
                      <h3 className="font-semibold text-white">Base64 Encoded Key</h3>
                      <CopyButton textToCopy={encodedResult} />
                    </div>
                    <pre className="p-4 text-sm text-gray-300 overflow-x-auto break-all whitespace-pre-wrap">
                      <code>{encodedResult}</code>
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label htmlFor="base64-input" className="block text-sm font-medium text-gray-300 mb-2">
                    Paste your Base64 encoded key
                  </label>
                  <textarea
                    id="base64-input"
                    rows={8}
                    value={base64Input}
                    onChange={(e) => setBase64Input(e.target.value)}
                    placeholder="Paste the single-line Base64 string from your environment variables..."
                    className="w-full bg-gray-900/80 border border-gray-600 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  ></textarea>
                </div>
                <div className="text-center">
                    <button onClick={handleDecode} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500">
                        Decode
                    </button>
                </div>
                {decodeError && (
                  <div className="bg-red-900/50 border border-red-500/50 text-red-300 px-4 py-3 rounded-md flex items-center gap-3">
                    <AlertTriangleIcon className="w-5 h-5" />
                    <span className="text-sm">{decodeError}</span>
                  </div>
                )}
                {decodedResult && (
                  <div className="bg-gray-900/70 rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center p-3 bg-gray-700/50">
                      <h3 className="font-semibold text-white">Decoded JSON Key</h3>
                      <CopyButton textToCopy={decodedResult} />
                    </div>
                    <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
                      <code>{decodedResult}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      <footer className="w-full max-w-4xl text-center py-4">
          <p className="text-sm text-gray-500">
              Created by <a href="https://www.linkedin.com/in/rogertbs/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-indigo-400 underline transition-colors duration-200">Roger Tadeu Santos</a>.
          </p>
      </footer>
    </div>
  );
}
