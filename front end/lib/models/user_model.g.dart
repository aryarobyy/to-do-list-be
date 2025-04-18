// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_UserModel _$UserModelFromJson(Map<String, dynamic> json) => _UserModel(
      userId: json['userId'] as String,
      username: json['username'] as String,
      name: json['name'] as String,
      role: $enumDecode(_$RoleEnumMap, json['role'], unknownValue: Role.USER),
      email: json['email'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$UserModelToJson(_UserModel instance) =>
    <String, dynamic>{
      'userId': instance.userId,
      'username': instance.username,
      'name': instance.name,
      'role': _$RoleEnumMap[instance.role]!,
      'email': instance.email,
      'createdAt': instance.createdAt.toIso8601String(),
    };

const _$RoleEnumMap = {
  Role.ADMIN: 'ADMIN',
  Role.USER: 'USER',
};
