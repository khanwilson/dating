import * as Clipboard from 'expo-clipboard';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { baseUrl } from 'src/data/api/resource';
import { ApiLogEntry, useApiLogStore } from './useApiLogStore';
interface Props {
  visible: boolean;
  onClose?: () => void;
}

const heightDevice = Dimensions.get('window').height

export const ModalApiLogs: React.FC<Props> = ({ visible, onClose }) => {
  const { logs, clearLogs, isEnabled, toggleLogging, } = useApiLogStore();
  const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');
  const [searchText, setSearchText] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: 'request' | 'response' | null }>({});

  const filteredLogs = useCallback(() => {
    let filtered = logs;

    // Filter by type
    if (filter === 'success') {
      filtered = filtered.filter(log => log.success);
    } else if (filter === 'error') {
      filtered = filtered.filter(log => !log.success);
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(log =>
        log.url.toLowerCase().includes(searchText.toLowerCase()) ||
        log.method.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  }, [logs, filter, searchText]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatDuration = (time?: number) => {
    if (!time) return 'N/A';
    return `${time}s`;
  };

  const getStatusColor = (status?: number | string, success?: boolean) => {
    if (!success) return '#FF3B30';
    if (typeof status === 'number') {
      if (status >= 200 && status < 300) return '#34C759';
      if (status >= 400) return '#FF3B30';
    }
    return '#007AFF';
  };

  const getMethodColor = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET':
        return '#61AFFE'; // Xanh dương nhạt
      case 'POST':
        return '#49CC90'; // Xanh lá
      case 'PUT':
        return '#FCA130'; // Cam
      case 'PATCH':
        return '#50E3C2'; // Xanh mint
      case 'DELETE':
        return '#F93E3E'; // Đỏ
      case 'HEAD':
        return '#9013FE'; // Tím
      case 'OPTIONS':
        return '#0D47A1'; // Xanh đậm
      default:
        return '#8E8E93'; // Xám mặc định
    }
  };

  const handleCopy = async (logId: string, data: any, type: 'request' | 'response') => {
    await Clipboard.setStringAsync(JSON.stringify(data, null, 2));
    setCopiedStates(prev => ({ ...prev, [logId]: type }));

    // Ẩn text "Copied!" sau 1s
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [logId]: null }));
    }, 1000);
  };

  const renderLogItem = (log: ApiLogEntry) => {
    const isExpanded = expandedLog === log.id;

    return (
      <View
        key={log.id}
        style={[styles.logItem, !log.success && styles.errorLogItem]}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setExpandedLog(isExpanded ? null : log.id)}
          style={styles.logHeader}>
          <View style={styles.logHeaderLeft}>
            <Text style={[styles.method, { color: getMethodColor(log.method) }]}>
              {log.method}
            </Text>
            <Text style={styles.url} numberOfLines={1}>
              {log.url.replace(baseUrl.value, '')}
            </Text>
          </View>
          <View style={styles.logHeaderRight}>
            <Text style={styles.time}>{formatTime(log.requestAt)}</Text>
            <Text style={styles.duration}>{formatDuration(log.time)}</Text>
            <Text style={[styles.status, { color: getStatusColor(log.status, log.success) }]}>
              {log.status}
            </Text>
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.logDetails}>
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'space-between' }}>
              <View>
                <Text style={styles.detailTitle}>Request At:</Text>
                <Text style={styles.detailText}>{log.requestAt}</Text>

                {log.responseAt && (
                  <>
                    <Text style={styles.detailTitle}>Response At:</Text>
                    <Text style={styles.detailText}>{log.responseAt}</Text>
                  </>
                )}
              </View>
              <View style={{ gap: 8 }}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.copyButton}
                  onPress={() => handleCopy(log.id,
                    ({
                      method: log.method,
                      url: log.url,
                      status: log.status,
                      requestData: log.requestData,
                    }), 'request')}>
                  <Text style={styles.detailText}>{'Copy raw request'}</Text>
                </TouchableOpacity>

                {copiedStates[log.id] ? (
                  <Text style={[styles.detailText, { color: '#34C759' }]}>{'Copied!'}</Text>
                ) : <View style={{ height: 16 }} />}

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[styles.copyButton, { backgroundColor: '#34C759' }]}
                  onPress={() => handleCopy(log.id,
                    ({
                      method: log.method,
                      url: log.url,
                      status: log.status,
                      requestData: log.requestData,
                      responseData: log.responseData,
                    }), 'response')}>
                  <Text style={styles.detailText}>{'Copy raw response'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {log.requestData && (
              <>
                <Text style={styles.detailTitle}>Request Data:</Text>
                <View style={styles.jsonContainer}>
                  <ScrollView
                    style={{ flex: 1 }}
                    nestedScrollEnabled={true}
                  >
                    <Text style={styles.jsonText} selectable={true}>
                      {JSON.stringify(log.requestData, null, 2)}
                    </Text>
                  </ScrollView>
                </View>
              </>
            )}

            {log.responseData && (
              <>
                <Text style={styles.detailTitle}>Response Data:</Text>
                <Text style={{ color: '#FFF', fontSize: 10 }}>Data length: {JSON.stringify(log.responseData, null, 2).length}</Text>
                <View style={styles.jsonContainer}>
                  <ScrollView
                    style={{
                      flex: 1,
                      backgroundColor: '#111',
                    }}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    removeClippedSubviews={false}
                  >
                    <Text style={styles.jsonText} selectable={true}>
                      {(() => {
                        try {
                          const jsonString = JSON.stringify(log.responseData, null, 2);
                          if (jsonString.length > 50000) {
                            return jsonString.substring(0, 50000) + '\n\n... (Truncated at 50k - data too large)';
                          }
                          return jsonString;
                        } catch (e) {
                          return 'Error when show response: ' + (e as Error).message;
                        }
                      })()}
                    </Text>
                  </ScrollView>
                </View>
              </>
            )}

            {log.errorMessage && (
              <>
                <Text style={styles.detailTitle}>Error Message:</Text>
                <Text style={[styles.detailText, { color: '#FF3B30' }]}>
                  {log.errorMessage}
                </Text>
              </>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>API Logs ({logs.length})</Text>
            <Text style={styles.url} numberOfLines={1}>
              Hosting: {baseUrl.value}
            </Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              activeOpacity={0.7}
              style={[styles.toggleButton, isEnabled ? styles.enabled : styles.disabled]}
              onPress={toggleLogging}
            >
              <Text style={styles.toggleText}>
                {isEnabled ? 'ON' : 'OFF'}
              </Text>
            </TouchableOpacity>
            {/* <TouchableOpacity
              activeOpacity={0.7} style={styles.exportButton} onPress={exportLogs}>
              <Text style={styles.exportText}>Export</Text>
            </TouchableOpacity> */}
            <TouchableOpacity
              activeOpacity={0.7} style={styles.clearButton} onPress={clearLogs}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by URL or method..."
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
          />
        </View>

        <View style={styles.filterContainer}>
          {['all', 'success', 'error'].map((filterType) => (
            <TouchableOpacity
              activeOpacity={0.7}
              key={filterType}
              style={[
                styles.filterButton,
                filter === filterType && styles.activeFilter
              ]}
              onPress={() => setFilter(filterType as typeof filter)}
            >
              <Text style={[
                styles.filterText,
                filter === filterType && styles.activeFilterText
              ]}>
                {filterType.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logs List */}

        <FlatList
          style={styles.logsList}
          data={filteredLogs()}
          renderItem={({ item }) => renderLogItem(item)}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={3}
          scrollEnabled={true}
          nestedScrollEnabled={true}
          ListEmptyComponent={<View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {logs.length === 0 ? 'No logs yet' : 'No logs match your filter'}
            </Text>
          </View>}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  enabled: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  disabled: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  toggleText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  exportButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  exportText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  clearButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 4,
  },
  clearText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  copyButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#50E3C2',
    borderRadius: 4,
  },
  closeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  searchContainer: {
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: '#1C1C1E',
    color: '#FFF',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#1C1C1E',
  },
  activeFilter: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFF',
  },
  logsList: {
    flex: 1,
  },
  logItem: {
    backgroundColor: '#1C1C1E',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#34C759',
  },
  errorLogItem: {
    borderLeftColor: '#FF3B30',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logHeaderLeft: {
    flex: 1,
    marginRight: 8,
  },
  logHeaderRight: {
    alignItems: 'flex-end',
  },
  method: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  url: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: '#8E8E93',
  },
  duration: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
  logDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 8,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#FFF',
    fontFamily: 'Courier',
    textAlign: 'right',
  },
  jsonContainer: {
    backgroundColor: '#000',
    borderRadius: 4,
    padding: 8,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#333',
    height: heightDevice / 3,
  },
  jsonText: {
    fontSize: 11,
    color: '#00FF00',
    fontFamily: 'Courier',
    lineHeight: 16,
    textAlign: 'left',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
