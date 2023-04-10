import {
  ModalFooter,
  ModalFooterActions,
  Button,
  ModalHeading,
  ModalHeader,
  Modal,
  ModalBody,
  Label,
  TextArea,
  Form,
  FormControl,
  FormActions,
  type UseToasterReturnedProps,
} from "@twilio-paste/core";
import axios from "axios";
import React, { useRef } from "react";

interface NotesEntryProps {
  modalIsOpen: boolean;
  handleModalToggle: (isOpen: boolean) => void;
  userDisplayName: string;
  handleToast: (toastObject: UseToasterReturnedProps) => void;
}

export const NotesEntry = ({
  modalIsOpen,
  handleModalToggle,
  userDisplayName,
  handleToast,
}: NotesEntryProps) => {
  const textareaRef = useRef(null);

  const createNote = async (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();

    if (!textareaRef.current) {
      return undefined;
    }

    try {
      const response = await axios({
        method: "post",
        url: `//localhost:3001/api/users/notes/${userDisplayName.toLowerCase()}`,
        data: {
          // @ts-ignore TODO: figure out later
          note: textareaRef.current.value,
        },
      });

      // @ts-ignore TODO: figure out
      if (response.data.success) {
        // @ts-ignore shut up
        handleToast.push({
          message: "Noted!",
          variant: "success",
          dismissAfter: 3000,
        });
        handleModalToggle(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const notesTextareaId = "note";

  return (
    <Modal
      ariaLabelledby={"notes modal"}
      isOpen={modalIsOpen}
      onDismiss={() => handleModalToggle(false)}
      size="default"
    >
      <Form
        action={`//localhost:3001/api/users/notes/${userDisplayName.toLowerCase()}`}
        method="POST"
      >
        <ModalHeader>
          <ModalHeading as="h3" id={"notes-modal"}>
            {userDisplayName}
          </ModalHeading>
        </ModalHeader>
        <ModalBody>
          <FormControl>
            <Label htmlFor={notesTextareaId} required>
              Note
            </Label>
            <TextArea
              onChange={() => {}}
              aria-describedby={notesTextareaId}
              id={notesTextareaId}
              name={notesTextareaId}
              required
              ref={textareaRef}
            />
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <ModalFooterActions>
            <FormActions>
              <Button
                variant="secondary"
                onClick={() => handleModalToggle(false)}
              >
                Cancel
              </Button>
              <Button variant="primary" onClick={(event) => createNote(event)}>
                Submit
              </Button>
            </FormActions>
          </ModalFooterActions>
        </ModalFooter>
      </Form>
    </Modal>
  );
};
