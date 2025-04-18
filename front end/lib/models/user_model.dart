
import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_model.freezed.dart';
part 'user_model.g.dart';

@JsonEnum()
enum Role {
  @JsonValue('ADMIN')
  ADMIN,
  @JsonValue('USER')
  USER,
}

@freezed
sealed class UserModel with _$UserModel {
  factory UserModel({
    required String userId,
    required String username,
    required String name,
    @JsonKey(unknownEnumValue: Role.USER) required Role role,
    required String email,
    required DateTime createdAt,
  }) = _UserModel;

  factory UserModel.fromJson(Map<String, dynamic> json) => _$UserModelFromJson(json);
}