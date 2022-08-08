import useAppContext from "src/hooks/useAppContext"
import useMintAndList from "src/hooks/useMintAndList"
import TransactionLoading from "./TransactionLoading"
import { Button, Form, Input, InputNumber, Upload } from 'antd';
import useNFTStorage from "src/hooks/useNFTStorage"
import { useState, useEffect } from "react"
import {useRouter} from "next/router"
import {paths, STATUS_SUCCESS, STATUS_FAILED, TYPE} from "src/global/constants"

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

export default function BadgesMinter() {
  const [{ isLoading, transactionStatus }, mint] = useMintAndList()
  const [ isUploading, uploadNftStorage ] = useNFTStorage()
  const {currentUser} = useAppContext()
  const router = useRouter()
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if(transactionStatus == null) return
    let status = STATUS_FAILED
    let title, msg, btn1Text, btn1Path, btn2Text, btn2Path = ""

    if(!transactionStatus.errorMessage) {
      status = STATUS_SUCCESS
      title = "Create badges Successfully"
      msg = "Congras! Just created a Badge!"
      btn1Text = "Home"
      btn1Path = "/"
      btn2Text = "Create Badge"
      btn2Path = paths.mintBadges
    }
    else {
      title = "Claimed Failed"
      msg = transactionStatus.errorMessage
      btn1Text = "Home"
      btn1Path = "/"
      btn2Text = "Create again"
      btn2Path = paths.mintBadges
    }
    const content = {title: title, msg: msg}
    console.log(JSON.stringify(content))
    router.push({pathname: paths.result, query: {status: status, type: TYPE.CLAIMED, title: title, msg: msg, btn1Text, btn1Path, btn2Text, btn2Path}})
  }, [transactionStatus])

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
        <h1 className="mb-10 text-5xl text-gray-darkest">Mint a New Item</h1>
        {/* <RarityScale /> */}

        {isLoading ? (
          <TransactionLoading status={transactionStatus} />
        ) : (
          // <Button onClick={mint} disabled={isLoading} roundedFull={true}>
          <Form {...layout} name="nest-messages" onFinish={onFinish} validateMessages={validateMessages} initialValues={{recipient: address, name:"Test Badge", max:1, description: "描述", royalty_cut: 0, royalty_receiver: address}}>
            <Form.Item name={['recipient']} label="Address" rules={[{ required: true }]} >
              <Input disabled={true}/>
            </Form.Item>
            <Form.Item name={['name']} label="Badge name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name={['max']} label="Total supply" rules={[{ type: 'number', min: 0, max: 9999, default: 9999, required: true }]}>
              <InputNumber />
            </Form.Item>
            <Form.Item name={['claim_code']} label="Claim Code" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name={['externalURL']} label="Website">
              <Input />
            </Form.Item>
            <Form.Item name={['badge_image']}  label="Badge image" rules={[{ required: true }]}>
              <Upload listType="picture-card" beforeUpload={beforeUpload} showUploadList={false} customRequest={handleUpload}>
                <div>
                  {/* <PlusOutlined /> */}
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              </Upload>
            </Form.Item>
            <Form.Item name={['description']} label="Description">
              <Input.TextArea />
            </Form.Item>
            <Form.Item name={['royalty_cut']} label="版税(%)" rules={[{ type: 'number', min: 0, max: 50, default: 0, required: true }]}>
              <InputNumber />
            </Form.Item>
            <Form.Item name={['royalty_description']} label="版税描述">
              <Input />
            </Form.Item>
            <Form.Item name={['royalty_receiver']} label="版税接收地址">
              <Input />
            </Form.Item>
            <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
              <Button type="primary" htmlType="submit" disabled={isLoading && isUploading} loading={isLoading || isUploading}>
                Submit
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>
  )
}
