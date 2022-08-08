import useAppContext from "src/hooks/useAppContext"
import useClaim from "src/hooks/useClaim"
import MinterLoader from "./MinterLoader"
import RarityScale from "./RarityScale"
import TransactionLoading from "./TransactionLoading"
import { Button, Form, Input, InputNumber, Upload } from 'antd';
import {useRouter} from "next/router"
import {paths, STATUS_SUCCESS, STATUS_FAILED, TYPE} from "src/global/constants"
import {useEffect} from "react"


export default function ClaimBadges() {
  const [{isLoading, transactionStatus}, mint] = useClaim()
  const {currentUser} = useAppContext()
  const router = useRouter()
  const address = currentUser?.addr

  const onFinish = (values) => {
    console.log(values);
    mint(values)
  };

  useEffect(() => {
    if(transactionStatus == null) return
    let status = STATUS_FAILED
    let title, msg, btn1Text, btn1Path, btn2Text, btn2Path = ""

    if(!transactionStatus.errorMessage) {
      status = STATUS_SUCCESS
      title = "Claimed Successfully"
      msg = "Congras! Just claimed a Badge!"
      btn1Text = "Go profile"
      btn1Path = paths.profile(currentUser?.addr)
      btn2Text = "Claim again"
      btn2Path = paths.claimBadges
    }
    else {
      title = "Claimed Failed"
      msg = transactionStatus.errorMessage
      btn1Text = "Home"
      btn1Path = "/"
      btn2Text = "Claim again"
      btn2Path = paths.claimBadges
    }
    const content = {title: title, msg: msg}
    console.log(JSON.stringify(content))
    router.push({pathname: paths.result, query: {status: status, type: TYPE.CLAIMED, title: title, msg: msg, btn1Text, btn1Path, btn2Text, btn2Path}})
  }, [transactionStatus])

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

  if (!currentUser) return null
  const curUserAddress = currentUser.addr

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2">

      <div className="flex flex-col pr-4 mt-14 lg:mt-24 lg:pt-20 lg:pl-14">
        <h1 className="mb-10 text-5xl text-gray-darkest">Claim a badge</h1>

        {isLoading ? (
          <TransactionLoading status={transactionStatus} />
        ) : (
          <>
            <Form name="nest-messages" onFinish={onFinish} validateMessages={validateMessages} initialValues={{recipient: curUserAddress}}>
              <Form.Item name={['claimCode']} label="Code" rules={[{ required: true }]} >
                <Input />
              </Form.Item>
              <Form.Item name={['recipient']} label="Recipient" rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" disabled={isLoading} loading={isLoading}>
                  Claim
                </Button>
              </Form.Item>
            </Form>
          </>
        )}
      </div>
    </div>
  )
}
