import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import './App.css'

interface FamilyMember {
  id: number;
  name: string;
}

function App() {
  const [events, setEvents] = useState<any[]>([]);

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    const saved = localStorage.getItem('familyMembers');
    return saved ? JSON.parse(saved) : [{ id: 1, name: '共有' }];
  });

  const [currentUser, setCurrentUser] = useState<FamilyMember>(familyMembers[0]);

  // ★ 1. 名前に応じて色を返す関数（ここでお好みの色に調整できます）
  const getEventColor = (name: string) => {
    switch (name) {
      case '共有': return '#9e9e9e'; // グレー
      case 'お父さん': return '#2196f3'; // 青
      case 'お母さん': return '#e91e63'; // ピンク
      case '子供': return '#4caf50'; // 緑
      default:
        // 追加された名前には文字数などから自動で色を割り当てる
        const colors = ['#f44336', '#9c27b0', '#673ab7', '#00bcd4', '#ff9800', '#795548'];
        const index = name.length % colors.length;
        return colors[index];
    }
  };

  useEffect(() => {
    localStorage.setItem('familyMembers', JSON.stringify(familyMembers));
  }, [familyMembers]);

  // ★ 2. 表示用のイベントデータを作成（色情報を追加）
  const coloredEvents = events.map(event => {
    // 登録者名（author_name）から色を取得
    const eventColor = getEventColor(event.author_name || '共有');
    return {
      ...event,
      backgroundColor: eventColor,
      borderColor: eventColor,
      textColor: '#ffffff' // 文字色は白で固定
    };
  });

const addFamilyMember = async () => {
  const name = prompt("追加する家族の名前を入力してください:");
  if (name) {
    try {
      // 1. Django側にユーザー作成を依頼
      const response = await fetch('http://127.0.0.1:8000/api/users/create/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name }),
      });

      if (response.ok) {
        const newUserFromDB = await response.json();
        // 2. Djangoから返ってきた「本物のID」でリストに追加
        const newMember: FamilyMember = { 
          id: newUserFromDB.id, 
          name: newUserFromDB.name 
        };
        setFamilyMembers([...familyMembers, newMember]);
        alert(`${name}さんを登録しました！`);
      } else {
        alert("ユーザーの作成に失敗しました。同じ名前が既に存在しませんか？");
      }
    } catch (error) {
      console.error("通信エラー:", error);
      alert("サーバーに接続できませんでした。");
    }
  }
};

  const removeFamilyMember = (id: number) => {
    if (id === 1) {
      alert("「共有」は削除できません。");
      return;
    }
    if (window.confirm("このメンバーをリストから削除しますか？")) {
      const newList = familyMembers.filter((member: FamilyMember) => member.id !== id);
      setFamilyMembers(newList);
      if (currentUser.id === id) {
        setCurrentUser(newList[0]);
      }
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/events/');
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("データ取得失敗:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDateClick = async (arg: { dateStr: string }) => {
    const title = prompt(`${currentUser.name}のカレンダーに予定を入力:`);
    const startDate = prompt("開始日 (YYYY-MM-DD)", arg.dateStr);
    const startTime = prompt("開始時間 (例 10:00)", "10:00");
    const endDate = prompt("終了日 (YYYY-MM-DD)", startDate || arg.dateStr);
    const endTime = prompt("終了時間 (例 12:00)", "12:00");

    if (title && startDate && startTime && endDate && endTime) {
      const newEvent = {
        title: title,
        start: `${startDate}T${startTime}:00`,
        end: `${endDate}T${endTime}:00`,
        user: currentUser.id,
        // 保存時に登録者名が確定できないため、author_nameの代わりにお互いが見てわかる工夫
        // (Django側で作成時にuserからusernameを引っ張る設定にしているので、再取得時に色が付きます)
      };

      try {
        const response = await fetch('http://127.0.0.1:8000/api/events/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEvent),
        });

        if (response.ok) {
          fetchEvents();
        } else {
          alert("保存に失敗しました。");
        }
      } catch (error) {
        alert("通信エラーが発生しました。");
      }
    }
  };

  const handleEventClick = async (clickInfo: any) => {
    const author = clickInfo.event.extendedProps.author_name || "不明";
    const startStr = new Date(clickInfo.event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const endStr = new Date(clickInfo.event.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    const message = `
【予定の詳細】
タイトル: ${clickInfo.event.title}
時間: ${startStr} ～ ${endStr}
登録者: ${author}

この予定を削除しますか？
    `;

    if (window.confirm(message)) {
      await fetch(`http://127.0.0.1:8000/api/events/${clickInfo.event.id}/`, { method: 'DELETE' });
      clickInfo.event.remove();
    }
  };

  return (
    <div className="calendar-container">
      <header>
        <h1>{currentUser.name}のカレンダー</h1>
        <div className="user-management" style={{ marginBottom: '20px' }}>
          <div className="member-buttons">
            {familyMembers.map((member: FamilyMember) => (
              <span key={member.id} style={{ position: 'relative', display: 'inline-block' }}>
                <button
                  onClick={() => setCurrentUser(member)}
                  style={{
                    margin: '5px',
                    padding: '8px 15px',
                    // ボタンの色もgetEventColorと合わせると直感的です
                    backgroundColor: currentUser.id === member.id ? getEventColor(member.name) : '#f0f0f0',
                    color: currentUser.id === member.id ? 'white' : '#333',
                    border: '1px solid #ccc',
                    borderRadius: '20px',
                    cursor: 'pointer'
                  }}
                >
                  {member.name}
                </button>
                {member.name !== '共有' && (
                  <button 
                    onClick={() => removeFamilyMember(member.id)}
                    style={{
                      position: 'absolute',
                      top: '-5px',
                      right: '0px',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      fontSize: '12px',
                      backgroundColor: '#ff4d4d',
                      color: 'white',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
            <button onClick={addFamilyMember} style={{ margin: '5px', padding: '8px 15px', backgroundColor: '#2196f3', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer' }}>
              + 名前を追加
            </button>
          </div>
        </div>
      </header>
      
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek'
        }}
        // ★ 3. 加工したイベント（色付き）を渡す
        events={coloredEvents}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        locale="ja"
      />
    </div>
  );
}

export default App;