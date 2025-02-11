import React, { FC, useContext, useState } from 'react';
import Input from '@/components/ui/Input/Input';
import { FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
import Button from '@/components/ui/Button/Button';
import { useSocket } from '@/utilis/hooks/useSocket';
import { AuthContext } from '@/providers/AuthProvider/AuthProvider';

interface ChatInputProps {
  handleSubmit: (values: { message: string }) => Promise<void>;
  chatId: string;
}

const ChatInput: FC<ChatInputProps> = ({ handleSubmit, chatId }) => {
  const socket = useSocket();
  const { user } = useContext(AuthContext);
  const [isTyping, setIsTyping] = useState(false);

  const formik = useFormik({
    initialValues: {
      message: ''
    },
    validationSchema: Yup.object().shape({
      message: Yup.string().required()
    }),
    onSubmit: async (values) => {
      await handleSubmit(values);
      formik.resetForm();
    }
  });

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket?.emit('typing', { message: `${user?.name} is typing...`, chatId, userId: user?.id });
    }

    debounceStopTyping();
  };

  const debounceStopTyping = (() => {
    let timer;
    return () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsTyping(false);
        socket?.emit('stopTyping', { chatId, userId: user?.id });
      }, 5000);
    };
  })();

  return (
    <FormikProvider value={formik}>
      <form className="p-4 flex w-full justify-between gap-2" onSubmit={formik.handleSubmit}>
        <Input
          name="message"
          type="text"
          placeholder="Type here..."
          value={formik.values.message}
          onChange={(event) => {
            formik.handleChange(event);
            handleTyping();
          }}
          className="w-full h-full"
          inputClassName="!mt-0"
        />
        <Button type="submit" text="Send" className="max-w-[120px]" onClick={formik.handleSubmit} />
      </form>
    </FormikProvider>
  );
};

export default ChatInput;
