import IpfsUploadTest from '../../components/IpfsUploadTest';

export const metadata = {
  title: 'IPFS Upload Test | FundChain',
  description: 'Test IPFS uploads for the FundChain application',
};

export default function IpfsTestPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">IPFS Upload Test</h1>
      <IpfsUploadTest />
    </div>
  );
} 