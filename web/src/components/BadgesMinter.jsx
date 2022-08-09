import useAppContext from "src/hooks/useAppContext"
import useMintAndList from "src/hooks/useMintAndList"
import MinterLoader from "./MinterLoader"
import RarityScale from "./RarityScale"
import TransactionLoading from "./TransactionLoading"
import { Button, Form, Input, InputNumber, Upload, Modal } from 'antd';
import useNFTStorage from "src/hooks/useNFTStorage"
import useLogin from "src/hooks/useLogin";
import 'antd/dist/antd.css';
import React, { useState } from 'react';
import { PlusCircleOutlined } from '@ant-design/icons';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 8 },
};

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => resolve(reader.result);

    reader.onerror = (error) => reject(error);
  });


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



export default function BadgesMinter() {
  const [{ isLoading, transactionStatus }, mint] = useMintAndList()
  const [ isUploading, uploadNftStorage ] = useNFTStorage()
  const {currentUser} = useAppContext()
  const [fileList, setFileList] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const handleCancel = () => setPreviewVisible(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }

    setPreviewImage(file.url || file.preview);
    setPreviewVisible(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const handleChange = ({ fileList: newFileList }) => {
    console.log(JSON.stringify(fileList));
    setFileList(newFileList);
  };

  if (!currentUser) return null
  const address = currentUser.addr

  const onFinish = (values) => {
    console.log(values);
    mint(values)
  };

  // async function convertToFile(originFile) {
  //   const content = await fs.promises.readFile(filePath)
  //   const type = mime.getType(filePath)
  //   return new File([content], path.basename(filePath), { type })
  // }

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

  const uploadButton = (
    <div>
      <PlusCircleOutlined />
      <div
        style={{
          marginTop: 8
        }}
      >
        Upload
      </div>
    </div>
  );

  return (
    <div className="">
      {/* <MinterLoader isLoading={isLoading} /> */}

      <div className="flex flex-col">
        <h1 className="mb-8 text-6xl text-gray-darkest font-extrabold text-center">Mint a New Item</h1>
        {/* <RarityScale /> */}

        {isLoading ? (
          <TransactionLoading status={transactionStatus} />
        ) : (
          // <Button onClick={mint} disabled={isLoading} roundedFull={true}>
          <Form {...layout} name="nest-messages" onFinish={onFinish} validateMessages={validateMessages} initialValues={{recipient: address, name:"test", max:1, description: "description", badge_image: "https://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_272x92dp.png"}}>
            <Form.Item name={['recipient']} label="Address" rules={[{ required: true }]} >
              <Input disabled={true}/>
            </Form.Item>
            <Form.Item name={['name']} label="Badge Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name={['max']} label="Amount" rules={[{ type: 'number', min: 0, max: 9999, default: 9999, required: true }]}>
              <InputNumber />
            </Form.Item>
            <Form.Item name={['externalURL']} label="URL">
              <Input />
            </Form.Item>
            <Form.Item name={['badge_image']}  label="Badge Picture" rules={[{ required: true }]}>
              <Upload listType="picture-card" beforeUpload={beforeUpload} customRequest={handleUpload} onPreview={handlePreview} onChange={handleChange}>
                {fileList.length >= 1 ? null : uploadButton}
              </Upload>
            </Form.Item>
            <Modal
                visible={previewVisible}
                title={previewTitle}
                footer={null}
                onCancel={handleCancel}
              >
                <img
                  alt="example"
                  style={{
                    width: "100%"
                  }}
                  src={previewImage}
                />
              </Modal>
            <Form.Item name={['description']} label="Description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item name={['royalty_cut']} label="Royalty">
              <Input />
            </Form.Item>
            <Form.Item name={['royalty_description']} label="Royalty Description ">
              <Input />
            </Form.Item>
            <Form.Item name={['royalty_receiver']} label="Royalty Receiver">
              <Input />
            </Form.Item>
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
              <Button type="primary" htmlType="Submit" disabled={isLoading && isUploading} shape="round" >
                Submit
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  )
}
