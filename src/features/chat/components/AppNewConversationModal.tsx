import { useNavigate } from 'react-router-dom'
import {
  conversationModeLabel,
  difficultyLabel,
  examFlowLabel,
  examProfileLabel,
} from '../../../content/copy'
import { useAppContext } from '../../../context/AppContext'
import { NewConversationModal } from '../../../components/NewConversationModal'

export function AppNewConversationModal() {
  const navigate = useNavigate()
  const { app } = useAppContext()

  return (
    <NewConversationModal
      language={app.language}
      isOpen={app.isNewConversationModalOpen}
      mode={app.newConversationMode}
      topic={app.newConversationTopic}
      examProfile={app.newConversationExamProfile}
      examFlow={app.newConversationExamFlow}
      difficulty={app.newConversationDifficulty}
      conversationModeLabel={conversationModeLabel}
      examProfileLabel={examProfileLabel}
      examFlowLabel={examFlowLabel}
      difficultyLabel={difficultyLabel}
      onModeChange={app.setNewConversationMode}
      onTopicChange={app.setNewConversationTopic}
      onExamProfileChange={app.setNewConversationExamProfile}
      onExamFlowChange={app.setNewConversationExamFlow}
      onDifficultyChange={app.setNewConversationDifficulty}
      onCancel={app.closeNewConversationModal}
      onCreate={() => {
        void app.startNewConversation().then((result) => {
          if (result === 'auth_required') {
            navigate('/auth')
            return
          }

          navigate('/chat')
        })
      }}
    />
  )
}
