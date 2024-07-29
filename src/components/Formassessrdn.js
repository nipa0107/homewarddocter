import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Assessreadiness1 from "./components/Assessrdnpage1";
import Assessreadiness2 from "./components/Assessrdnpage2";
import Result from './Result';

function App() {
  const methods = useForm();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const nextStep = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const onSubmit = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    toast.success('ประเมินเรียบร้อย');
    setStep(step + 1);
  };

  return (
    <FormProvider {...methods}>
      <div className="App">
        {step === 1 && <Assessreadiness1 nextStep={nextStep} />}
        {step === 2 && <Assessreadiness2 nextStep={nextStep} prevStep={prevStep} onSubmit={onSubmit} />}
        {step === 3 && <Result data={formData} />}
      </div>
      <ToastContainer />
    </FormProvider>
  );
}

export default App;
