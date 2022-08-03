import useAppContext from "src/hooks/useAppContext"
import useClaim from "src/hooks/useClaim"
import MinterLoader from "./MinterLoader"
import RarityScale from "./RarityScale"
import TransactionLoading from "./TransactionLoading"
import { Button, Form, Input, InputNumber, Upload } from 'antd';

export default function ClaimBadges() {
  const [{isLoading, transactionStatus}, mint] = useClaim()
  const {currentUser} = useAppContext()

  const onFinish = (values) => {
    console.log(values);
    mint(values)
  };

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
      <MinterLoader isLoading={isLoading} />

      <div className="flex flex-col pr-4 mt-14 lg:mt-24 lg:pt-20 lg:pl-14">
        <h1 className="mb-10 text-5xl text-gray-darkest">Claim a new badge</h1>
        <RarityScale />

        {isLoading ? (
          <TransactionLoading status={transactionStatus} />
        ) : (
          <>
            <Form name="nest-messages" onFinish={onFinish} validateMessages={validateMessages} initialValues={{recipient: curUserAddress}}>
              <Form.Item name={['claimCode']} label="Code" rules={[{ required: true }]} >
                <Input />
              </Form.Item>
              <Form.Item name={['recipient']} label="recipient" rules={[{ required: true }]} >
                <Input />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" disabled={isLoading}>
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
