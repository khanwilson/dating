import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ApiLogEdgeSwipe } from './ApiLogEdgeSwipe';

interface Props {
  children: React.ReactNode;
  // enableApiLogs prop removed - now controlled by ZustandSession
}

export const hocApiLogger = (WrappedComponent: React.ComponentType<any>) => {
  return React.forwardRef<any, Props>((props, ref) => {
    const { children, ...otherProps } = props;

    return (
      <View style={styles.container}>
        <WrappedComponent ref={ref} {...otherProps}>
          {children}
        </WrappedComponent>
        <ApiLogEdgeSwipe />
      </View>
    );
  });
};

// Alternative component-based approach
export const ApiLoggerProvider: React.FC<Props> = ({ 
  children 
}) => {
  return (
    <View style={styles.container}>
      {children}
      <ApiLogEdgeSwipe />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
