// import Button from "src/components/Button"
import useMintAndList from "src/hooks/useMintAndList"
import MinterLoader from "./MinterLoader"
import RarityScale from "./RarityScale"
import TransactionLoading from "./TransactionLoading"
import { Button, Form, Input, InputNumber, Upload } from 'antd';
import useNFTStorage from "src/hooks/useNFTStorage"
import { useState } from "react"


const onFinish = (values) => {
  console.log(values);
};

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



export default function Minter() {
  const [{ isLoading, transactionStatus }, mint] = useMintAndList()
  const [ isUploading, uploadNftStorage ] = useNFTStorage()

  const [fileList, setFileList] = useState([]);

  // async function convertToFile(originFile) {
  //   const content = await fs.promises.readFile(filePath)
  //   const type = mime.getType(filePath)
  //   return new File([content], path.basename(filePath), { type })
  // }

  const handleUpload = async (option) => {
    const file = option.file
    console.log("upload file")
    console.log(file)
    uploadNftStorage(file, file.name, "next", 
      (responseUrl) => {
        console.log("upload success:" + responseUrl)
        option.onSuccess(responseUrl)
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
        <h1 className="mb-10 text-5xl text-gray-darkest">Mint a New Item</h1>
        {/* <RarityScale /> */}

        {isLoading ? (
          <TransactionLoading status={transactionStatus} />
        ) : (
          // <Button onClick={mint} disabled={isLoading} roundedFull={true}>
          <Form {...layout} name="nest-messages" onFinish={onFinish} validateMessages={validateMessages}>
            <Form.Item name={['user', 'merchant_name']} label="商户名称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name={['user', 'badge_name']} label="徽章名称" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name={['user', 'total']} label="总量" rules={[{ type: 'number', min: 0, max: 9999, default: 9999, required: true }]}>
              <InputNumber />
            </Form.Item>
            <Form.Item name={['user', 'website']} label="网址">
              <Input />
            </Form.Item>
            <Form.Item label="徽章图片" valuePropName="fileList">
              <Upload listType="picture-card" beforeUpload={beforeUpload} showUploadList={false} customRequest={handleUpload}>
                <div>
                  {/* <PlusOutlined /> */}
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
            <Form.Item name={['user', 'description']} label="描述">
              <Input.TextArea />
            </Form.Item>
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
              <Button onClick={mint} type="primary" htmlType="submit" disabled={isLoading}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  )
}
