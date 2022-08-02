//import Button from "src/components/Button"
import useMintAndList from "src/hooks/useMintAndList"
import MinterLoader from "./MinterLoader"
import RarityScale from "./RarityScale"
import TransactionLoading from "./TransactionLoading"
import { Button } from 'antd';
import React from 'react'
import { useFileUpload } from 'src/hooks/useUpload'



export default function Upload() {
  //const [{isLoading, transactionStatus}, mint] = useMintAndList()
  const [file, selectFile] = useFileUpload()
    return (


      <div className="grid grid-cols-1 lg:grid-cols-2">
      <button class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        onClick={() => {
          // Single File Upload
          selectFile()
        }}
      >
        Upload
      </button>

      {file ? (
        <div>
          <img src={file.source} alt='preview' />
          <span> Name: {file.name} </span>
          <span> Size: {file.size} </span>
        </div>
      ) : (
        <span>No file selected</span>
      )}
    </div>

    


      
      
    )
  };  







