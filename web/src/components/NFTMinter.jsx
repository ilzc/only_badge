import useAppContext from "src/hooks/useAppContext"
import useMintAndList from "src/hooks/useMintAndList"
import MinterLoader from "./MinterLoader"
import RarityScale from "./RarityScale"
import TransactionLoading from "./TransactionLoading"
import { Button, Form, Input, InputNumber, Upload } from 'antd';
import useNFTStorage from "src/hooks/useNFTStorage"
import { useState } from "react"
import useLogin from "src/hooks/useLogin";
import useMintNFTMinter from "src/hooks/useMintNFTMinter"

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

/* eslint-disable no-template-curly-in-string */
const validateMessages = {
  required: '${label} is required!',
  types: {
    email: '${label} is not a valid email!',
    number: '${label} is not a valid number!',
  },
  number: {
    range: '${label} must be between ${min} and ${max}',
  },
};

const beforeUpload = (file) => {
  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';

  if (!isJpgOrPng) {
    message.error('You can only upload JPG/PNG file!');
  }

  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isLt2M) {
    message.error('Image must smaller than 2MB!');
  }

  return isJpgOrPng && isLt2M;
};

export default function NFTMinter() {
  const [{ isLoading, transactionStatus }, mint] = useMintNFTMinter()
  const [ isUploading, uploadNftStorage ] = useNFTStorage()
  const {currentUser} = useAppContext()

  if (!currentUser) return null
  const address = currentUser.addr

  const onFinish = (values) => {
    console.log(values);
    mint(values)
  };

  const handleUpload = async (option) => {
    const file = option.file
    console.log("upload file")
    console.log(file)
    let fileName = file.name;
    let fileType = fileName.split('.')[1];
    let renameFile = new File( [file],"nft_img"  +  '.' + fileType, option)
    uploadNftStorage(renameFile, "OnlyBadge", "Merchants Logo", 
      (responseUrl, data, ipnft) => {
        console.log("upload success:" + ipnft)
        console.log("upload success metadata:" + JSON.stringify(data))
        option.onSuccess(ipnft)
      }, 
      ()=> {
        console.log("upload error:" + error)
        option.onError(error)
      })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">
      {/* <MinterLoader isLoading={isLoading} /> */}

      <div className="flex flex-col pr-4 mt-14 lg:mt-24 lg:pt-20 lg:pl-14">
        <h1 className="mb-10 text-5xl text-gray-darkest">创建商户</h1>
        {/* <RarityScale /> */}

        {isLoading ? (
          <TransactionLoading status={transactionStatus} />
        ) : (
          // <Button onClick={mint} disabled={isLoading} roundedFull={true}>
          <Form {...layout} name="nest-messages" onFinish={onFinish} validateMessages={validateMessages} initialValues={{name:"测试商户"}}>
            <Form.Item name={['name']} label="商户名称" rules={[{ required: true }]} >
              <Input />
            </Form.Item>
            {/* <Form.Item name={['imagePath']} label="商户logo" rules={[{ required: true }]}>
              <Input />
            </Form.Item> */}
            <Form.Item name={['image']} label="商户logo" rules={[{ required: true }]}>
              <Upload listType="picture-card" beforeUpload={beforeUpload} showUploadList={false} customRequest={handleUpload}>
                <div>
                  {/* <PlusOutlined /> */}
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
              <Button type="primary" htmlType="submit" disabled={isLoading || isUploading}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  )
}
