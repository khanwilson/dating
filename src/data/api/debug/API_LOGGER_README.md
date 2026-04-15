# API Logger - Debug Modal cho Production

## 🎯 Tính năng

API Logger là một hệ thống backdoor cho phép dev kiểm tra API logs trên môi trường production một cách dễ dàng.

### ✨ Các tính năng chính:

1. **Auto Logging**: Tự động log tất cả API requests/responses
2. **Edge Swipe Gesture**: Vuốt từ cạnh phải sang trái để mở modal
3. **Completely Hidden**: Không có UI elements nào hiển thị trên màn hình
4. **Filter & Search**: Lọc logs theo success/error và tìm kiếm
5. **Export Logs**: Xuất logs để share
6. **Real-time Updates**: Cập nhật logs theo thời gian thực

## 🚀 Cách sử dụng

### 1. Wrap App với ApiLoggerProvider

```tsx
import { ApiLoggerProvider } from './src/apiLogger';

export default function App() {
  return (
    <ApiLoggerProvider enableApiLogs={true}>
      <YourAppContent />
    </ApiLoggerProvider>
  );
}
```

### 2. Hoặc sử dụng HOC

```tsx
import { withApiLogger } from './src/apiLogger';

const AppWithLogger = withApiLogger(YourApp);

export default function App() {
  return <AppWithLogger enableApiLogs={true} />;
}
```

### 3. Configuration cho các môi trường

```tsx
import { getApiLogConfig, ApiLoggerProvider } from './src/apiLogger';

export default function App() {
  const config = getApiLogConfig();
  
  return (
    <ApiLoggerProvider enableApiLogs={config.enabled}>
      <YourAppContent />
    </ApiLoggerProvider>
  );
}
```

## 🔧 Cách mở Modal Log

### Development Mode:
- Vuốt từ cạnh phải sang trái để mở modal
- Visual feedback khi vuốt (edge highlight)

### Production Mode (Backdoor):
1. **Vuốt từ cạnh phải** màn hình về phía trái
2. Modal logs sẽ mở ngay lập tức
3. Hoàn toàn ẩn danh - không có button hay UI nào hiển thị

### Chi tiết Gesture:
- **Vùng detect**: 40px từ cạnh phải màn hình
- **Threshold**: Vuốt ít nhất 15% chiều rộng màn hình
- **Visual feedback**: Edge sáng lên khi detect gesture

## 📱 Giao diện Modal

### Header Controls:
- **ON/OFF**: Bật/tắt logging
- **Export**: Xuất logs ra file
- **Clear**: Xóa tất cả logs

### Filter Options:
- **ALL**: Hiển thị tất cả logs
- **SUCCESS**: Chỉ hiển thị requests thành công
- **ERROR**: Chỉ hiển thị requests lỗi

### Search:
- Tìm kiếm theo URL hoặc HTTP method

### Log Details:
- Tap vào log item để xem chi tiết
- Hiển thị request/response data đầy đủ
- Timing information (requestAt, responseAt, duration)

## 🎨 Visual Indicators

### Edge Swipe Feedback:
- **Blue edge**: Hiển thị khi detect gesture
- **Progressive feedback**: Độ sáng tăng theo tiến trình vuốt
- **Success flash**: Flash khi trigger thành công

### Log Items:
- **Green border**: Successful requests
- **Red border**: Failed requests
- **Status codes**: Color coded
- **Timing**: Response duration

## 🔒 Bảo mật

1. **Development**: Gesture enabled by default
2. **Production**: Gesture always available nhưng hoàn toàn ẩn
3. **No UI Elements**: Không có button hay indicator nào hiển thị
4. **Logs**: Chỉ lưu trong memory, không persist
5. **Auto cleanup**: Giới hạn số lượng logs (configurable)

## ⚙️ Configuration

```tsx
// Tùy chỉnh config cho từng environment
const config = {
  enabled: true,           // Bật/tắt logging
  maxLogs: 100,           // Số logs tối đa
  showFloatingButton: true // Hiển thị button
};
```

## 🐛 Troubleshooting

### Gesture không hoạt động:
- Kiểm tra `enableApiLogs` prop
- Thử vuốt từ cạnh phải vào trong chậm rãi
- Đảm bảo vuốt ít nhất 15% chiều rộng màn hình
- Kiểm tra console có logs "Edge swipe detected" không

### Modal không mở:
- Kiểm tra có visual feedback (blue edge) không
- Vuốt mạnh hơn hoặc nhanh hơn
- Kiểm tra console logs để debug

### Logs không hiển thị:
- Kiểm tra toggle ON/OFF trong modal
- Verify interceptor đã được add vào axios

### Performance:
- Logs tự động cleanup sau `maxLogs` items
- Có thể tắt logging trong production nếu cần

## 📝 Example Usage

```tsx
import React from 'react';
import { ApiLoggerProvider } from './src/apiLogger';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  // Enable cho tất cả môi trường, nhưng hidden trong production
  const enableLogs = true;
  
  return (
    <ApiLoggerProvider enableApiLogs={enableLogs}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </ApiLoggerProvider>
  );
}
```

Với setup này, bạn có thể debug API một cách dễ dàng trên bất kỳ môi trường nào! 🎉
