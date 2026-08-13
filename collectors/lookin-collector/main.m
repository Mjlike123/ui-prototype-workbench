#import <Foundation/Foundation.h>
#import <AppKit/AppKit.h>
#import <dispatch/dispatch.h>
#import <netinet/in.h>

static const uint32_t LookinRequestTypePing = 200;
static const uint32_t LookinRequestTypeApp = 201;
static const uint32_t LookinRequestTypeHierarchy = 202;
static const int LookinUSBDeviceIPv4PortNumberStart = 47175;
static const int LookinUSBDeviceIPv4PortNumberEnd = 47179;
static const int LookinSimulatorIPv4PortNumberStart = 47164;
static const int LookinSimulatorIPv4PortNumberEnd = 47169;

@class Lookin_PTChannel, Lookin_PTUSBHub, Lookin_PTData, Lookin_PTAddress;

@protocol Lookin_PTChannelDelegate <NSObject>
- (void)ioFrameChannel:(Lookin_PTChannel *)channel didReceiveFrameOfType:(uint32_t)type tag:(uint32_t)tag payload:(Lookin_PTData *)payload;
@optional
- (BOOL)ioFrameChannel:(Lookin_PTChannel *)channel shouldAcceptFrameOfType:(uint32_t)type tag:(uint32_t)tag payloadSize:(uint32_t)payloadSize;
- (void)ioFrameChannel:(Lookin_PTChannel *)channel didEndWithError:(NSError *)error;
- (void)ioFrameChannel:(Lookin_PTChannel *)channel didAcceptConnection:(Lookin_PTChannel *)otherChannel fromAddress:(Lookin_PTAddress *)address;
@end

@interface Lookin_PTUSBHub : NSObject
+ (Lookin_PTUSBHub *)sharedHub;
@end

@interface Lookin_PTChannel : NSObject
@property (strong) id<Lookin_PTChannelDelegate> delegate;
@property (readonly) BOOL isConnected;
+ (Lookin_PTChannel *)channelWithDelegate:(id<Lookin_PTChannelDelegate>)delegate;
- (void)connectToPort:(int)port overUSBHub:(Lookin_PTUSBHub *)usbHub deviceID:(NSNumber *)deviceID callback:(void(^)(NSError *error))callback;
- (void)connectToPort:(in_port_t)port IPv4Address:(in_addr_t)address callback:(void(^)(NSError *error, Lookin_PTAddress *address))callback;
- (void)sendFrameOfType:(uint32_t)frameType tag:(uint32_t)tag withPayload:(dispatch_data_t)payload callback:(void(^)(NSError *error))callback;
- (void)close;
@end

@interface Lookin_PTData : NSObject
@property (readonly) void *data;
@property (readonly) size_t length;
@end

@interface Collector : NSObject <Lookin_PTChannelDelegate>
@property(nonatomic, strong) NSMutableArray<NSNumber *> *usbDeviceIDs;
@property(nonatomic, strong) NSMutableDictionary<NSNumber *, id> *responses;
@property(nonatomic, strong) NSMutableDictionary<NSNumber *, dispatch_semaphore_t> *semaphores;
@end

@implementation Collector

- (instancetype)init {
  if (self = [super init]) {
    _usbDeviceIDs = [NSMutableArray array];
    _responses = [NSMutableDictionary dictionary];
    _semaphores = [NSMutableDictionary dictionary];
  }
  return self;
}

- (BOOL)ioFrameChannel:(Lookin_PTChannel *)channel shouldAcceptFrameOfType:(uint32_t)type tag:(uint32_t)tag payloadSize:(uint32_t)payloadSize {
  return YES;
}

- (void)ioFrameChannel:(Lookin_PTChannel *)channel didReceiveFrameOfType:(uint32_t)type tag:(uint32_t)tag payload:(Lookin_PTData *)payload {
  NSData *data = [NSData dataWithBytes:payload.data length:payload.length];
  NSError *error = nil;
  id object = [NSKeyedUnarchiver unarchivedObjectOfClass:[NSObject class] fromData:data error:&error];
  NSNumber *key = @(tag);

  @synchronized (self) {
    self.responses[key] = object ?: error ?: [NSNull null];
    dispatch_semaphore_t semaphore = self.semaphores[key];
    if (semaphore) {
      dispatch_semaphore_signal(semaphore);
    }
  }
}

- (void)ioFrameChannel:(Lookin_PTChannel *)channel didEndWithError:(NSError *)error {
}

- (NSArray<NSNumber *> *)discoverUSBDeviceIDsWithTimeout:(NSTimeInterval)timeout {
  NSString *attachName = @"Lookin_PTUSBDeviceDidAttachNotification";
  __weak typeof(self) weakSelf = self;
  id observer = [[NSNotificationCenter defaultCenter] addObserverForName:attachName object:nil queue:nil usingBlock:^(NSNotification *note) {
    NSNumber *deviceID = note.userInfo[@"DeviceID"];
    if (deviceID && ![weakSelf.usbDeviceIDs containsObject:deviceID]) {
      [weakSelf.usbDeviceIDs addObject:deviceID];
    }
  }];

  [Lookin_PTUSBHub sharedHub];
  NSDate *deadline = [NSDate dateWithTimeIntervalSinceNow:timeout];
  while ([[NSDate date] compare:deadline] == NSOrderedAscending) {
    [[NSRunLoop currentRunLoop] runMode:NSDefaultRunLoopMode beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.05]];
  }

  [[NSNotificationCenter defaultCenter] removeObserver:observer];
  return self.usbDeviceIDs.copy;
}

- (Lookin_PTChannel *)connectToUSBDevice:(NSNumber *)deviceID port:(int)port timeout:(NSTimeInterval)timeout error:(NSError **)error {
  Lookin_PTChannel *channel = [Lookin_PTChannel channelWithDelegate:self];
  dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
  __block NSError *connectError = nil;
  [channel connectToPort:port overUSBHub:[Lookin_PTUSBHub sharedHub] deviceID:deviceID callback:^(NSError *err) {
    connectError = err;
    dispatch_semaphore_signal(semaphore);
  }];
  if (![self waitSemaphore:semaphore timeout:timeout]) {
    [channel close];
    if (error) {
      *error = [NSError errorWithDomain:@"LookinCollector" code:1 userInfo:@{NSLocalizedDescriptionKey: @"USB connect timeout"}];
    }
    return nil;
  }
  if (connectError) {
    [channel close];
    if (error) {
      *error = connectError;
    }
    return nil;
  }
  return channel;
}

- (Lookin_PTChannel *)connectToSimulatorPort:(int)port timeout:(NSTimeInterval)timeout error:(NSError **)error {
  Lookin_PTChannel *channel = [Lookin_PTChannel channelWithDelegate:self];
  dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
  __block NSError *connectError = nil;
  [channel connectToPort:port IPv4Address:INADDR_LOOPBACK callback:^(NSError *err, Lookin_PTAddress *address) {
    connectError = err;
    dispatch_semaphore_signal(semaphore);
  }];
  if (![self waitSemaphore:semaphore timeout:timeout]) {
    [channel close];
    if (error) {
      *error = [NSError errorWithDomain:@"LookinCollector" code:2 userInfo:@{NSLocalizedDescriptionKey: @"Simulator connect timeout"}];
    }
    return nil;
  }
  if (connectError) {
    [channel close];
    if (error) {
      *error = connectError;
    }
    return nil;
  }
  return channel;
}

- (id)requestType:(uint32_t)type data:(id)data channel:(Lookin_PTChannel *)channel timeout:(NSTimeInterval)timeout error:(NSError **)error {
  uint32_t tag = (uint32_t)[[NSDate date] timeIntervalSince1970] ^ arc4random_uniform(UINT32_MAX);
  dispatch_semaphore_t semaphore = dispatch_semaphore_create(0);
  NSNumber *key = @(tag);

  id attachment = [NSClassFromString(@"LookinConnectionAttachment") new];
  [attachment setValue:data forKey:@"data"];

  NSError *archiveError = nil;
  NSData *archive = [NSKeyedArchiver archivedDataWithRootObject:attachment requiringSecureCoding:YES error:&archiveError];
  if (archiveError) {
    if (error) {
      *error = archiveError;
    }
    return nil;
  }

  void *buffer = malloc(archive.length);
  memcpy(buffer, archive.bytes, archive.length);
  dispatch_data_t payload = dispatch_data_create(buffer, archive.length, dispatch_get_main_queue(), DISPATCH_DATA_DESTRUCTOR_FREE);

  @synchronized (self) {
    self.semaphores[key] = semaphore;
  }

  __block NSError *sendError = nil;
  [channel sendFrameOfType:type tag:tag withPayload:payload callback:^(NSError *err) {
    sendError = err;
  }];

  if (![self waitSemaphore:semaphore timeout:timeout]) {
    @synchronized (self) {
      [self.semaphores removeObjectForKey:key];
    }
    if (error) {
      *error = [NSError errorWithDomain:@"LookinCollector" code:3 userInfo:@{NSLocalizedDescriptionKey: @"Lookin request timeout"}];
    }
    return nil;
  }

  @synchronized (self) {
    [self.semaphores removeObjectForKey:key];
  }
  if (sendError) {
    if (error) {
      *error = sendError;
    }
    return nil;
  }

  id response = self.responses[key];
  [self.responses removeObjectForKey:key];
  if ([response isKindOfClass:[NSError class]]) {
    if (error) {
      *error = response;
    }
    return nil;
  }
  if ([response isKindOfClass:[NSNull class]]) {
    if (error) {
      *error = [NSError errorWithDomain:@"LookinCollector" code:4 userInfo:@{NSLocalizedDescriptionKey: @"Lookin response decode failed"}];
    }
    return nil;
  }

  NSError *serverError = nil;
  @try {
    serverError = [response valueForKey:@"error"];
  } @catch (__unused NSException *exception) {
  }
  if (serverError) {
    if (error) {
      *error = serverError;
    }
    return nil;
  }
  return response;
}

- (BOOL)waitSemaphore:(dispatch_semaphore_t)semaphore timeout:(NSTimeInterval)timeout {
  NSDate *deadline = [NSDate dateWithTimeIntervalSinceNow:timeout];
  while ([[NSDate date] compare:deadline] == NSOrderedAscending) {
    if (dispatch_semaphore_wait(semaphore, DISPATCH_TIME_NOW) == 0) {
      return YES;
    }
    [[NSRunLoop currentRunLoop] runMode:NSDefaultRunLoopMode beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.02]];
  }
  return NO;
}

- (NSDictionary *)snapshotFromHierarchy:(id)hierarchy appInfo:(id)appInfo {
  NSArray *displayItems = [self safeValue:@"displayItems" object:hierarchy] ?: @[];
  NSMutableArray *children = [NSMutableArray array];
  for (id item in displayItems) {
    [children addObject:[self nodeFromDisplayItem:item index:children.count]];
  }

  double width = [[self safeValue:@"screenWidth" object:appInfo] doubleValue] ?: 0;
  double height = [[self safeValue:@"screenHeight" object:appInfo] doubleValue] ?: 0;
  double scale = [[self safeValue:@"screenScale" object:appInfo] doubleValue] ?: 1;
  NSString *pageName = [self safeValue:@"appName" object:appInfo] ?: @"Lookin Page";
  NSString *deviceName = [self safeValue:@"deviceDescription" object:appInfo] ?: @"iOS Device";

  return @{
    @"pageName": pageName,
    @"device": @{
      @"name": deviceName,
      @"width": @(width),
      @"height": @(height),
      @"scale": @(scale)
    },
    @"root": @{
      @"id": @"root",
      @"name": @"LookinRoot",
      @"type": @"UIWindow",
      @"frame": @{@"x": @0, @"y": @0, @"width": @(width), @"height": @(height)},
      @"children": children
    }
  };
}

- (NSDictionary *)nodeFromDisplayItem:(id)item index:(NSUInteger)index {
  NSValue *frameValue = [self safeValue:@"frame" object:item];
  CGRect frame = frameValue ? frameValue.rectValue : CGRectZero;
  id viewObject = [self safeValue:@"viewObject" object:item] ?: [self safeValue:@"layerObject" object:item];
  NSArray *classChain = [self safeValue:@"classChainList" object:viewObject] ?: @[];
  NSString *type = classChain.firstObject ?: NSStringFromClass([item class]);
  NSString *customTitle = [self safeValue:@"customDisplayTitle" object:item];
  NSString *text = [self textFromDisplayItem:item];
  NSNumber *hidden = [self safeValue:@"isHidden" object:item] ?: @NO;
  NSNumber *alpha = [self safeValue:@"alpha" object:item] ?: @1;
  NSArray *subitems = [self safeValue:@"subitems" object:item] ?: @[];
  NSMutableArray *children = [NSMutableArray array];
  for (id child in subitems) {
    [children addObject:[self nodeFromDisplayItem:child index:children.count]];
  }

  NSMutableDictionary *node = [@{
    @"id": [NSString stringWithFormat:@"%p", item],
    @"name": customTitle ?: type,
    @"type": type,
    @"frame": @{@"x": @(frame.origin.x), @"y": @(frame.origin.y), @"width": @(frame.size.width), @"height": @(frame.size.height)},
    @"visible": @(!hidden.boolValue && alpha.doubleValue > 0),
    @"children": children
  } mutableCopy];
  if (text.length) {
    node[@"text"] = text;
  }
  return node;
}

- (NSString *)textFromDisplayItem:(id)item {
  NSArray *groups = [self safeValue:@"attributesGroupList" object:item] ?: @[];
  for (id group in groups) {
    for (id section in ([self safeValue:@"attrSections" object:group] ?: @[])) {
      for (id attr in ([self safeValue:@"attributes" object:section] ?: @[])) {
        NSString *identifier = [self safeValue:@"identifier" object:attr];
        id value = [self safeValue:@"value" object:attr];
        if ([identifier isKindOfClass:[NSString class]] && [identifier.lowercaseString containsString:@"text"] && [value isKindOfClass:[NSString class]]) {
          return value;
        }
      }
    }
  }
  return nil;
}

- (id)safeValue:(NSString *)key object:(id)object {
  if (!object) {
    return nil;
  }
  @try {
    return [object valueForKey:key];
  } @catch (__unused NSException *exception) {
    return nil;
  }
}

@end

static NSDictionary *ParseArgs(int argc, const char * argv[]) {
  NSMutableDictionary *args = [NSMutableDictionary dictionary];
  for (int i = 1; i < argc; i++) {
    NSString *key = [NSString stringWithUTF8String:argv[i]];
    if ([key hasPrefix:@"--"] && i + 1 < argc) {
      args[[key substringFromIndex:2]] = [NSString stringWithUTF8String:argv[++i]];
    }
  }
  return args;
}

static void PrintJSON(id object) {
  NSData *data = [NSJSONSerialization dataWithJSONObject:object options:NSJSONWritingPrettyPrinted error:nil];
  fwrite(data.bytes, 1, data.length, stdout);
  fputc('\n', stdout);
}

static void PrintErrorAndExit(NSString *message) {
  PrintJSON(@{@"ok": @NO, @"error": message});
  exit(1);
}

int main(int argc, const char * argv[]) {
  @autoreleasepool {
    NSDictionary *args = ParseArgs(argc, argv);
    NSString *mode = args[@"mode"] ?: @"usb";
    NSString *bundleID = args[@"bundle-id"];
    Collector *collector = [Collector new];
    NSMutableArray<NSDictionary *> *candidates = [NSMutableArray array];

    if ([mode isEqualToString:@"simulator"] || [mode isEqualToString:@"both"]) {
      for (int port = LookinSimulatorIPv4PortNumberStart; port <= LookinSimulatorIPv4PortNumberEnd; port++) {
        [candidates addObject:@{@"kind": @"simulator", @"port": @(port)}];
      }
    }

    if ([mode isEqualToString:@"usb"] || [mode isEqualToString:@"both"]) {
      NSArray<NSNumber *> *deviceIDs = [collector discoverUSBDeviceIDsWithTimeout:1.0];
      for (NSNumber *deviceID in deviceIDs) {
        for (int port = LookinUSBDeviceIPv4PortNumberStart; port <= LookinUSBDeviceIPv4PortNumberEnd; port++) {
          [candidates addObject:@{@"kind": @"usb", @"deviceID": deviceID, @"port": @(port)}];
        }
      }
    }

    if (!candidates.count) {
      PrintErrorAndExit(@"No Lookin USB devices or simulator ports found.");
    }

    NSMutableArray *errors = [NSMutableArray array];
    for (NSDictionary *candidate in candidates) {
      NSError *error = nil;
      Lookin_PTChannel *channel = nil;
      if ([candidate[@"kind"] isEqualToString:@"usb"]) {
        channel = [collector connectToUSBDevice:candidate[@"deviceID"] port:[candidate[@"port"] intValue] timeout:1.0 error:&error];
      } else {
        channel = [collector connectToSimulatorPort:[candidate[@"port"] intValue] timeout:1.0 error:&error];
      }
      if (!channel || error) {
        [errors addObject:error.localizedDescription ?: @"connect failed"];
        continue;
      }

      id ping = [collector requestType:LookinRequestTypePing data:nil channel:channel timeout:2.0 error:&error];
      if (!ping || error) {
        [channel close];
        [errors addObject:error.localizedDescription ?: @"ping failed"];
        continue;
      }

      id appResponse = [collector requestType:LookinRequestTypeApp data:@{@"needImages": @NO, @"local": @[]} channel:channel timeout:2.0 error:&error];
      id appInfo = [appResponse valueForKey:@"data"];
      NSString *appBundleID = [collector safeValue:@"appBundleIdentifier" object:appInfo];
      if (bundleID.length && ![appBundleID isEqualToString:bundleID]) {
        [channel close];
        continue;
      }

      id hierarchyResponse = [collector requestType:LookinRequestTypeHierarchy data:@{@"clientVersion": @"ui-prototype-workbench"} channel:channel timeout:8.0 error:&error];
      if (!hierarchyResponse || error) {
        [channel close];
        [errors addObject:error.localizedDescription ?: @"hierarchy failed"];
        continue;
      }

      id hierarchy = [hierarchyResponse valueForKey:@"data"];
      NSDictionary *snapshot = [collector snapshotFromHierarchy:hierarchy appInfo:appInfo];
      [channel close];
      PrintJSON(@{@"ok": @YES, @"snapshot": snapshot});
      return 0;
    }

    PrintErrorAndExit([NSString stringWithFormat:@"No active Lookin app matched. Errors: %@", [errors componentsJoinedByString:@"; "]]);
  }
}
