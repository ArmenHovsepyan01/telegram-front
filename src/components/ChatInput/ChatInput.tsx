import { FC, useContext, useState } from 'react';
import Input from '@/components/ui/Input/Input';
import { FormikProvider, useFormik } from 'formik';
import * as Yup from 'yup';
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
      <form
        className="mb-2 flex lg:max-w-[calc(100%-120px)] sm:max-w-full mx-auto w-full justify-between gap-2 bg-white rounded-md"
        onSubmit={formik.handleSubmit}>
        <Input
          name="message"
          type="text"
          placeholder="Message..."
          value={formik.values.message}
          onChange={(event) => {
            formik.handleChange(event);
            handleTyping();
          }}
          className="w-full h-full"
          inputClassName="!mt-0"
          inputClassNames="!border-none !outline-none"
        />
        <button type="submit" className="px-2">
          <span className="icon-send text-xl text-[#8BABD8]" />
        </button>
      </form>
    </FormikProvider>
  );
};

export default ChatInput;
